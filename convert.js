const Jimp = require('jimp');

// 颜色常量定义
const EPD_7IN3F_BLACK   = 0x0;  // 黑色
const EPD_7IN3F_WHITE   = 0x1;  // 白色
const EPD_7IN3F_GREEN   = 0x2;  // 绿色
const EPD_7IN3F_BLUE    = 0x3;  // 蓝色
const EPD_7IN3F_RED     = 0x4;  // 红色
const EPD_7IN3F_YELLOW  = 0x5;  // 黄色
const EPD_7IN3F_ORANGE  = 0x6;  // 橙色

// 定义目标显示尺寸
const EPD_WIDTH = 800;
const EPD_HEIGHT = 480;

// 颜色映射函数
function getClosestColor(r, g, b) {
    const colors = [
        { color: EPD_7IN3F_BLACK,   rgb: [0, 0, 0] },
        { color: EPD_7IN3F_WHITE,   rgb: [255, 255, 255] },
        { color: EPD_7IN3F_GREEN,   rgb: [0, 255, 0] },
        { color: EPD_7IN3F_BLUE,    rgb: [0, 0, 255] },
        { color: EPD_7IN3F_RED,     rgb: [255, 0, 0] },
        { color: EPD_7IN3F_YELLOW,  rgb: [255, 255, 0] },
        { color: EPD_7IN3F_ORANGE,  rgb: [255, 165, 0] }
    ];

    let minDistance = Infinity;
    let closestColor = EPD_7IN3F_WHITE;

    for (const color of colors) {
        const distance = Math.sqrt(
            Math.pow(r - color.rgb[0], 2) +
            Math.pow(g - color.rgb[1], 2) +
            Math.pow(b - color.rgb[2], 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color.color;
        }
    }

    return closestColor;
}

// 图片转换函数
async function convertImageToHexArray(imagePath) {
    try {
        // 读取图片
        const image = await Jimp.read(imagePath);
        
        // 计算保持宽高比的尺寸
        const originalWidth = image.bitmap.width;
        const originalHeight = image.bitmap.height;
        const targetRatio = EPD_WIDTH / EPD_HEIGHT;
        const originalRatio = originalWidth / originalHeight;
        
        let newWidth, newHeight;
        if (originalRatio > targetRatio) {
            // 图片更宽，以宽度为基准
            newWidth = EPD_WIDTH;
            newHeight = Math.floor(EPD_WIDTH / originalRatio);
        } else {
            // 图片更高，以高度为基准
            newHeight = EPD_HEIGHT;
            newWidth = Math.floor(EPD_HEIGHT * originalRatio);
        }
        
        // 调整图片大小，保持宽高比
        image.resize(newWidth, newHeight);
        
        // 创建新图片并填充白色背景
        const resizedImage = new Jimp(EPD_WIDTH, EPD_HEIGHT, 0xFFFFFFFF);
        
        // 计算居中位置
        const xOffset = Math.floor((EPD_WIDTH - newWidth) / 2);
        const yOffset = Math.floor((EPD_HEIGHT - newHeight) / 2);
        
        // 将调整后的图片复制到新图片的居中位置
        resizedImage.composite(image, xOffset, yOffset);
        
        // 创建十六进制数组
        const hexArray = [];
        
        // 遍历每个像素
        for (let y = 0; y < EPD_HEIGHT; y++) {
            for (let x = 0; x < EPD_WIDTH; x++) {
                const pixel = Jimp.intToRGBA(resizedImage.getPixelColor(x, y));
                const closestColor = getClosestColor(pixel.r, pixel.g, pixel.b);
                hexArray.push(closestColor);
            }
        }

        // 创建新图片用于预览
        const previewImage = new Jimp(EPD_WIDTH, EPD_HEIGHT);
        
        // 将七色数据转换为预览图片
        hexArray.forEach((color, index) => {
            const x = index % EPD_WIDTH;
            const y = Math.floor(index / EPD_WIDTH);
            let rgb;
            
            switch(color) {
                case EPD_7IN3F_BLACK: rgb = [0, 0, 0]; break;
                case EPD_7IN3F_WHITE: rgb = [255, 255, 255]; break;
                case EPD_7IN3F_GREEN: rgb = [0, 255, 0]; break;
                case EPD_7IN3F_BLUE: rgb = [0, 0, 255]; break;
                case EPD_7IN3F_RED: rgb = [255, 0, 0]; break;
                case EPD_7IN3F_YELLOW: rgb = [255, 255, 0]; break;
                case EPD_7IN3F_ORANGE: rgb = [255, 165, 0]; break;
            }
            
            previewImage.setPixelColor(Jimp.rgbaToInt(rgb[0], rgb[1], rgb[2], 255), x, y);
        });

        // 保存预览图片
        await previewImage.writeAsync('preview.png');
        console.log('预览图片已保存为 preview.png');

        return hexArray;
    } catch (error) {
        console.error('转换图片时出错:', error);
        throw error;
    }
}

// 执行转换
convertImageToHexArray('小蓝鸟.png');




