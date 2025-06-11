import type { POI } from "@/types/poi";
import { CATEGORIES } from "@/types/poi";

export function createEnhancedBalloonContent(poi: POI, poiId: string): string {
  const category = CATEGORIES[poi.category];

  return `
    <div style="
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 300px;
      padding: 0;
      margin: -8px;
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    ">
      <!-- Изображение -->
      <div style="
        width: 100%;
        height: 160px;
        background-image: url('${poi.images[0] || "https://cdn.builder.io/api/v1/image/assets%2F0968c4d4542442209a8c7e4e9ccf912f%2F2b1b389a9e0d42b1b44fead0b8aa3338"}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: ${category.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        ">${category.name}</div>
      </div>

      <!-- Контент -->
      <div style="padding: 16px;">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
        ">${poi.name}</h3>

        <p style="
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        ">${poi.shortDescription}</p>

        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          font-size: 12px;
          color: #9ca3af;
        ">
          <span style="margin-right: 4px;">📍</span>
          <span>${poi.address}</span>
        </div>

        <!-- Кнопки -->
        <div style="
          display: flex;
          gap: 8px;
        ">
          <button
            onclick="handleRouteClick('${poiId}')"
            style="
              flex: 1;
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)'"
          >
            🗺️ Маршрут
          </button>

          <button
            onclick="handleDetailClick('${poiId}')"
            style="
              flex: 1;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.3)'"
          >
            ℹ️ Подробнее
          </button>
        </div>
      </div>
    </div>
  `;
}
