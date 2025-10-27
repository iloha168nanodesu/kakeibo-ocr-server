// Serverless Functionのエントリーポイント
const Tesseract = require('tesseract.js');

// Vercel Serverless Functionとしてエクスポート
module.exports = async (req, res) => {
    // POSTメソッド以外は拒否
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed. Only POST is accepted for OCR processing.');
        return;
    }

    // 1. Base64画像データを取得
    // req.bodyにはGASから送られたJSONデータが含まれる
    const base64Image = req.body.image; 

    if (!base64Image) {
        res.status(400).json({ error: 'Image data is missing in the request body.' });
        return;
    }
  
    try {
        // 2. Base64文字列をバイナリBufferに変換
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // 3. TesseractでOCRを実行
        // 'jpn' は日本語の学習データを使用することを指定
        const { data: { text } } = await Tesseract.recognize(
            imageBuffer, 
            'jpn', 
        );
        
        // 4. OCR結果をJSON形式で返す (GAS側が期待する形式)
        res.status(200).json({ fullText: text }); 

    } catch (error) {
        console.error("Tesseract OCR Error:", error);
        // エラーが発生した場合、GAS側が処理できるようJSONで返す
        res.status(500).json({ 
            error: 'OCR processing failed on the server.', 
            details: error.message 
        });
    }
};