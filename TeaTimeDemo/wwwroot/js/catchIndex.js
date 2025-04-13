// 提取文本並轉換為RESX的主要函數
const extractAndConvertToResx = () => {
    // 提取文本
    const extractTextFromDOM = () => {
        const textMap = new Map();

        // 選擇所有可能包含文本的元素
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            // 獲取直接文本內容，排除script和style標籤的內容
            const text = Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ')
                .trim();

            if (text.length > 0) {
                // 使用文本內容作為鍵來去重
                if (!textMap.has(text)) {
                    // 生成資源鍵名
                    const key = generateResourceKey(text);
                    textMap.set(text, {
                        key: key,
                        value: text
                    });
                }
            }
        });

        return Array.from(textMap.values());
    };

    // 生成RESX格式的資源鍵名
    const generateResourceKey = (text) => {
        // 將文本轉換為合法的資源鍵名
        // 1. 移除特殊字符
        // 2. 將空格轉換為下劃線
        // 3. 確保以字母開頭
        let key = text
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/^\d+/, 'text_$&')
            .substring(0, 50); // 限制長度

        return key || 'text_' + Math.random().toString(36).substring(7);
    };

    // 將文本數據轉換為RESX格式
    const convertToResx = (textData) => {
        const lines = [
            '<?xml version="1.0" encoding="utf-8"?>',
            '<root>',
            '  <xsd:schema id="root" xmlns="" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">',
            '    <xsd:element name="root" msdata:IsDataSet="true">',
            '      <xsd:complexType>',
            '        <xsd:choice maxOccurs="unbounded">',
            '          <xsd:element name="data">',
            '            <xsd:complexType>',
            '              <xsd:sequence>',
            '                <xsd:element name="value" type="xsd:string" minOccurs="0" msdata:Ordinal="1" />',
            '              </xsd:sequence>',
            '              <xsd:attribute name="name" type="xsd:string" />',
            '            </xsd:complexType>',
            '          </xsd:element>',
            '        </xsd:choice>',
            '      </xsd:complexType>',
            '    </xsd:element>',
            '  </xsd:schema>',
            ''
        ];

        // 添加每個文本項
        textData.forEach(item => {
            lines.push('  <data name="' + escapeXml(item.key) + '">');
            lines.push('    <value>' + escapeXml(item.value) + '</value>');
            lines.push('  </data>');
        });

        lines.push('</root>');
        return lines.join('\n');
    };

    // XML特殊字符轉義
    const escapeXml = (unsafe) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    // 下載RESX文件
    const downloadResx = (resxContent) => {
        const blob = new Blob([resxContent], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Resources.resx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    try {
        // 執行提取和轉換流程
        const textData = extractTextFromDOM();
        const resxContent = convertToResx(textData);
        downloadResx(resxContent);
        console.log('成功提取並轉換了 ' + textData.length + ' 個文本項');
        return textData;
    } catch (error) {
        console.error('提取或轉換過程中發生錯誤：', error);
        throw error;
    }
};

// 在DOM加載完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 創建一個按鈕來觸發提取
    const button = document.createElement('button');
    button.textContent = '提取文本並下載RESX';
    button.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000; padding: 10px;';
    button.onclick = extractAndConvertToResx;
    document.body.appendChild(button);
});