const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio");
const { z } = require("zod");
const fs = require('fs-extra');
const path = require('path');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');

// 파일 읽기 함수
async function readFileContent(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.txt':
      case '.md':
        return await fs.readFile(filePath, 'utf-8');
      
      case '.docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;
      
      case '.pdf':
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
      
      case '.xlsx':
      case '.xls':
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        let result = '';
        sheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          result += `Sheet: ${sheetName}\n`;
          result += xlsx.utils.sheet_to_csv(worksheet);
          result += '\n\n';
        });
        return result;
      
      default:
        throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
    }
  } catch (error: any) {
    throw new Error(`파일 읽기 오류: ${error?.message || '알 수 없는 오류'}`);
  }
}

console.log("MCP 서버 초기화를 시작합니다...");

const server = new McpServer({
  name: "Document Analyzer",
  version: "1.0.0"
});

console.log("MCP 서버가 초기화되었습니다.");

// 문서 읽기 도구
server.tool(
  "readDocument",
  { 
    filePath: z.string().describe("읽을 파일의 경로")
  },
  async ({ filePath }: { filePath: string }) => {
    try {
      const content = await readFileContent(filePath);
      return {
        content: [{
          type: "text",
          text: content
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `파일을 읽는 중 오류가 발생했습니다: ${error}`
        }],
        isError: true
      };
    }
  }
);

// 문서 쓰기 도구
server.tool(
  "writeDocument",
  { 
    filePath: z.string().describe("쓸 파일의 경로"),
    content: z.string().describe("파일에 쓸 내용")
  },
  async ({ filePath, content }: { filePath: string; content: string }) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return {
        content: [{
          type: "text",
          text: `파일이 성공적으로 저장되었습니다: ${filePath}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `파일을 쓰는 중 오류가 발생했습니다: ${error}`
        }],
        isError: true
      };
    }
  }
);

// 디렉토리 분석 도구
server.tool(
  "analyzeDirectory",
  { 
    dirPath: z.string().describe("분석할 디렉토리 경로"),
    fileTypes: z.array(z.string()).optional().describe("분석할 파일 확장자 목록 (예: ['.txt', '.pdf'])")
  },
  async ({ dirPath, fileTypes }: { dirPath: string, fileTypes?: string[] }) => {
    try {
      const files = await fs.readdir(dirPath);
      const supportedTypes = fileTypes || ['.txt', '.md', '.docx', '.pdf', '.xlsx', '.xls'];
      
      const analysis = await Promise.all(files.map(async (file: string) => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        const ext = path.extname(file).toLowerCase();
        
        return {
          name: file,
          path: filePath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
          type: ext,
          isSupported: supportedTypes.includes(ext)
        };
      }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `디렉토리 분석 중 오류가 발생했습니다: ${error}`
        }],
        isError: true
      };
    }
  }
);

// 문서 분석 프롬프트
server.prompt(
  "analyzeDocuments",
  "여러 문서를 분석하고 요약하는 프롬프트",
  async (extra: any) => {
    const args = extra as { dirPath: string; fileTypes?: string[] };
    try {
      const files = await fs.readdir(args.dirPath);
      const supportedTypes = args.fileTypes || ['.txt', '.md', '.docx', '.pdf', '.xlsx', '.xls'];
      
      let allContent = '';
      for (const file of files) {
        const filePath = path.join(args.dirPath, file);
        const ext = path.extname(file).toLowerCase();
        
        if (supportedTypes.includes(ext)) {
          try {
            const content = await readFileContent(filePath);
            allContent += `\n\n=== ${file} ===\n${content}`;
          } catch (error) {
            console.error(`${file} 읽기 실패:`, error);
          }
        }
      }

      return {
        messages: [{
          role: "assistant",
          content: {
            type: "text",
            text: `다음은 ${args.dirPath} 디렉토리의 문서들입니다. 이 내용을 바탕으로 분석하고 요약하겠습니다.\n\n${allContent}`
          }
        }]
      };
    } catch (error) {
      return {
        messages: [{
          role: "assistant",
          content: {
            type: "text",
            text: `문서 분석 중 오류가 발생했습니다: ${error}`
          }
        }]
      };
    }
  }
);

// 서버 시작
console.log("문서 분석 MCP 서버가 시작되었습니다.");
console.log("현재 작업 디렉토리:", process.cwd());
console.log("Node.js 버전:", process.version);

// 서버 실행
console.log("StdioServerTransport를 초기화합니다...");
const transport = new StdioServerTransport();

console.log("서버 연결을 시도합니다...");
server.connect(transport).then(() => {
  console.log("서버가 성공적으로 연결되었습니다.");
  
  // 서버가 계속 실행되도록 유지
  process.stdin.resume();
  
  process.on('SIGINT', () => {
    console.log("서버를 종료합니다...");
    process.exit(0);
  });
}).catch((error: Error) => {
  console.error("서버 연결 중 오류가 발생했습니다:", error);
  process.exit(1);
}); 