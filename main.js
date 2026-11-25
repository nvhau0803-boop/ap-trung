
const { app, BrowserWindow, Tray, Menu, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Định danh ứng dụng trên Windows
if (process.platform === 'win32') {
    app.setAppUserModelId('He Thong Ap Trung 3D');
}

// Tạo cửa sổ ứng dụng
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'HỆ THỐNG ẤP TRỨNG 3D',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Nhấn X thì ẩn ứng dụng xuống khay
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    createTray();
}

// Tạo biểu tượng khay hệ thống
function createTray() {
    if (tray) return;

    try {
        tray = new Tray(path.join(__dirname, 'background.jpg'));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Mở lại ứng dụng',
                click: () => showMainWindow()
            },
            { type: 'separator' },
            {
                label: 'Thoát hẳn',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('Hệ Thống Ấp Trứng 3D đang chạy ngầm...');
        tray.setContextMenu(contextMenu);

        tray.on('double-click', () => showMainWindow());
    } catch (error) {
        console.error('Không tải được icon tray:', error);
    }
}

// Hiện lại cửa sổ ứng dụng
function showMainWindow() {
    if (!mainWindow) {
        createWindow();
        return;
    }

    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();
}

// Nhận yêu cầu thông báo từ file index.html
ipcMain.on('show-hatch-notification', (event, time) => {
    if (!time) return;

    const { d = 0, h = 0, m = 0, s = 0 } = time;

    if (!Notification.isSupported()) {
        console.log('Hệ thống không hỗ trợ thông báo.');
        return;
    }

    const notification = new Notification({
        title: '🐥 CHÚC MỪNG! Trứng đã nở!',
        body: `Trứng đã nở thành công!\nQuá hạn: ${d} ngày ${h} giờ ${m} phút ${s} giây.\nBấm vào đây để mở ứng dụng.`,
        // icon: path.join(__dirname, 'icon.ico')
    });

    notification.on('click', () => {
        showMainWindow();
    });

    notification.show();
});

// Khởi động ứng dụng
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        showMainWindow();
    });
});

// Khi đóng cửa sổ cuối cùng, tiếp tục chạy ngầm trên Windows
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && isQuitting) {
        app.quit();
    }
});

// Cho phép thoát hoàn toàn khi người dùng chọn "Thoát hẳn"
app.on('before-quit', () => {
    isQuitting = true;
});