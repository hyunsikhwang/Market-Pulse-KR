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
      
      // Day of Week in Seoul
      let dayOfWeek = 1;
      try {
        dayOfWeek = Number(formatInTimeZone(now, "Asia/Seoul", "i"));
      } catch (e) {
        // Fallback calculation for Seoul timezone (UTC+9)
        const utcDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        dayOfWeek = utcDate.getUTCDay(); // 0 (Sun) to 6 (Sat)
        if (dayOfWeek === 0) dayOfWeek = 7;
      }
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      
      // KRX Market Hours: weekdays 09:00 ~ 15:30 (540 ~ 930 minutes)
      const isKrxOpen = isWeekday && timeInMinutes >= 540 && timeInMinutes <= 930;
      
      // NXT Market Hours: weekdays 08:00 ~ 20:00 (480 ~ 1200 minutes)
      const isNxtOpen = isWeekday && timeInMinutes >= 480 && timeInMinutes <= 1200;
      
      let tradeType: "KRX" | "NXT" = "KRX";
      let marketLabel = "KRX 정규장";
      let isRegularSession = false;
      
      if (isKrxOpen && isNxtOpen) {
        // KRX 와 NXT 가 동시에 열려있을 때는 KRX
        tradeType = "KRX";
        marketLabel = "KRX 정규장";
        isRegularSession = true;
      } else if (!isKrxOpen && isNxtOpen) {
        // KRX 가 closed 되고 NXT 만 열려있을 땐 NXT
        tradeType = "NXT";
        marketLabel = "NXT 장외";
        isRegularSession = false;
      } else {
        // 둘 다 closed 상태일 때는 KRX 기준으로 조회
        tradeType = "KRX";
        marketLabel = "KRX (종가)";
        isRegularSession = false;
      }

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
          marketLabel,
          timestamp: formatInTimeZone(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
          isRegularSession
        }
      });
    } catch (error: any) {
      console.error("API Error details:", error.message, error.stack);
      if (error.response) {
        console.error("Axios response error data:", error.response.status, error.response.data);
      }
      res.status(500).json({ 
        error: "Failed to fetch stock data", 
        message: error.message,
        stack: error.stack,
        details: error.response ? { status: error.response.status, data: error.response.data } : "No response data"
      });
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
