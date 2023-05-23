const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');

const screenshot = require('screenshot-desktop');

var robot = require("robotjs");


const os = require('os');

const interfaces = os.networkInterfaces();

let ipAddress;

for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    for (const iface of interface) {
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
            break;
        }
    }
    if (ipAddress) {
        break;
    }
}

// prints the IP address to the console



var text5 = (ipAddress);

var text3 = "http://";
var text4 = ":5001";
var results = text3.concat(text5, text4)
//var xclient ='https://430b-2405-201-2c-d84d-c0e1-561b-66f0-a2ae.ngrok-free.app/remoteview'
console.log("IP ADDRESS : " + ipAddress)
//console.log("Enter this url on client browser : "+results+"/remoteview");
console.log("Enter this url on client browser : http://remoteaccesspro:5001/remoteview")
var socket = require('socket.io-client')(results);
var interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 185,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false

        }
    })
    win.removeMenu();
    win.loadFile('index.html')

    socket.on("mouse-move", function (data) {
        var obj = JSON.parse(data);
        var x = obj.x;
        var y = obj.y;

        robot.moveMouse(x, y);
    })

    socket.on("mouse-click", function (data) {
        robot.mouseClick();
    })




    socket.on("type", function (data) {
        //console.log(data)
        var obj = JSON.parse(data);
        var key = obj.key;
        if (data === key) robot.keyTap(key)
        try { robot.keyTap(key) }
        catch (err) { console.log(err) }
    })

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on("start-share", function (event, arg) {

    var uuid = uuidv4()
        .replace(/-/g, '')
        .slice(0, 16)
        .replace(/(..)/g, '$1-')
        .slice(0, 8)
        .replace(/-$/, '');

    socket.emit("join-message", uuid);
    event.reply("uuid", uuid);

    interval = setInterval(function () {
        screenshot().then((img) => {
            var imgStr = Buffer.from(img).toString('base64');

            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit("screen-data", JSON.stringify(obj));
        })
    }, 100)
})

ipcMain.on("stop-share", function (event, arg) {

    clearInterval(interval);
})