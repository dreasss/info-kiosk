import type { POI } from "@/types/poi";
import { CATEGORIES } from "@/types/poi";

export function createEnhancedBalloonContent(poi: POI, poiId: string): string {
  const category = CATEGORIES[poi.category];

  return `
    <div style="
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 320px;
      padding: 0;
      margin: -8px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8);
      position: relative;
    ">
      <!-- Декоративная верхняя полоска -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, ${category.color}, ${category.color}dd, ${category.color});
        z-index: 10;
      "></div>

      <!-- Изображение с улучшенными эффектами -->
      <div style="
        width: 100%;
        height: 180px;
        background-image: url('${poi.images[0] || "https://cdn.builder.io/api/v1/image/assets%2F0968c4d4542442209a8c7e4e9ccf912f%2F2b1b389a9e0d42b1b44fead0b8aa3338"}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        overflow: hidden;
      ">
        <!-- Градиентный оверлей -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.1) 100%);
        "></div>

        <!-- Категория с современным дизайном -->
        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, ${category.color}, ${category.color}dd);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
        ">${category.name}</div>

        <!-- Декоративные элементы -->
        <div style="
          position: absolute;
          bottom: 12px;
          left: 12px;
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>

      <!-- Основной контент с улучшенным дизайном -->
      <div style="padding: 20px; position: relative;">
        <!-- Декоративная иконка -->
        <div style="
          position: absolute;
          top: -15px;
          left: 20px;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, ${category.color}, ${category.color}dd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          border: 3px solid white;
        ">📍</div>

        <h3 style="
          margin: 8px 0 10px 0;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          background: linear-gradient(135deg, #111827, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        ">${poi.name}</h3>

        <p style="
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          font-weight: 500;
        ">${poi.shortDescription}</p>

        <!-- Адрес с иконкой -->
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding: 10px;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 12px;
          font-size: 12px;
          color: #4b5563;
          font-weight: 600;
        ">
          <span style="
            margin-right: 8px;
            background: ${category.color}20;
            padding: 4px;
            border-radius: 6px;
            font-size: 14px;
          ">📍</span>
          <span>${poi.address}</span>
        </div>

        <!-- Современные кнопки -->
        <div style="
          display: flex;
          gap: 10px;
        ">
          <button
            onclick="handleRouteClick('${poiId}')"
            style="
              flex: 1;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
              color: white;
              border: none;
              padding: 14px 18px;
              border-radius: 16px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
              position: relative;
              overflow: hidden;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            "
            onmouseover="
              this.style.transform='translateY(-2px) scale(1.02)';
              this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.5)';
            "
            onmouseout="
              this.style.transform='translateY(0) scale(1)';
              this.style.boxShadow='0 4px 14px rgba(59, 130, 246, 0.4)';
            "
          >
            <span style="position: relative; z-index: 2;">🗺️ Маршрут</span>
          </button>

          <button
            onclick="handleDetailClick('${poiId}')"
            style="
              flex: 1;
              background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
              color: white;
              border: none;
              padding: 14px 18px;
              border-radius: 16px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
              position: relative;
              overflow: hidden;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            "
            onmouseover="
              this.style.transform='translateY(-2px) scale(1.02)';
              this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.5)';
            "
            onmouseout="
              this.style.transform='translateY(0) scale(1)';
              this.style.boxShadow='0 4px 14px rgba(16, 185, 129, 0.4)';
            "
          >
            <span style="position: relative; z-index: 2;">ℹ️ Подробнее</span>
          </button>
        </div>
      </div>

      <!-- Декоративная нижняя полоска -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 20px;
        right: 20px;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${category.color}40, transparent);
        border-radius: 1px;
      "></div>
    </div>
  `;
}
