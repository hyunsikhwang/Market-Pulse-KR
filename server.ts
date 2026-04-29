import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { formatInTimeZone } from "date-fns-tz";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const { marketType = "ALL", pageSize = "50" } = req.query;
      
      // Seoul timezone logic
      const now = new Date();
      const seoulTime = formatInTimeZone(now, "Asia/Seoul", "HH:mm");
      const [hours, minutes] = seoulTime.split(":").map(Number);
      const timeInMinutes = hours * 60 + minutes;
      
      // 09:00 (540) to 15:00 (900)
      const isRegularSession = timeInMinutes >= 540 && timeInMinutes <= 900;
      const tradeType = isRegularSession ? "KRX" : "NXT";

      const url = `https://stock.naver.com/api/domestic/market/stock/default?tradeType=${tradeType}&marketType=${marketType}&orderType=marketSum&startIdx=0&pageSize=${pageSize}`;
      
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      // Normalize data: Naver API can return a list or an object with a data property
      const rawStocks = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      const normalizedData = rawStocks.map((item: any) => ({
        itemname: item.itemname,
        itemcode: item.itemcode,
        sosok: String(item.sosok),
        nowVal: Number(item.nowVal ?? item.nowPrice ?? 0),
        changeVal: Number(item.changeVal ?? item.changePrice ?? 0),
        changeRate: Number(item.changeRate ?? item.prevChangeRate ?? 0),
        risefall: String(item.risefall ?? item.upDownGb ?? '3'),
        marketSum: Number(item.marketSum ?? 0),
        accAmount: Number(item.accAmount ?? item.tradeAmount ?? 0),
        accQuant: Number(item.accQuant ?? item.tradeVolume ?? 0),
        per: item.per ? Number(item.per) : undefined,
        pbr: item.pbr ? Number(item.pbr) : undefined,
        roe: item.roe ? Number(item.roe) : undefined,
        dividendRate: item.dividendRate ? Number(item.dividendRate) : undefined,
        roa: item.roa ? Number(item.roa) : undefined,
        high52week: Number(item.high52week ?? item.week52HighPrice ?? 0),
        low52week: Number(item.low52week ?? item.week52LowPrice ?? 0),
        openVal: Number(item.openVal ?? item.openPrice ?? 0),
        highVal: Number(item.highVal ?? item.highPrice ?? 0),
        lowVal: Number(item.lowVal ?? item.lowPrice ?? 0),
        prevQuant: Number(item.prevQuant ?? 0)
      }));

      res.json({
        data: normalizedData,
        meta: {
          tradeType,
          marketLabel: isRegularSession ? "KRX 정규장" : "NXT 장외",
          timestamp: formatInTimeZone(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
          isRegularSession
        }
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
