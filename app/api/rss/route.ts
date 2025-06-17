import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 },
      );
    }

    // Проверяем, что URL безопасен
    const allowedDomains = [
      "elementy.ru",
      "ria.ru",
      "rg.ru",
      "gazeta.ru",
      "lenta.ru",
      "jinr.ru",
      "nplus1.ru",
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some((domain) =>
      urlObj.hostname.includes(domain),
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 },
      );
    }

    console.log(`RSS Proxy: Fetching ${url}`);

    // Загружаем RSS с сервера
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JINR-RSS-Reader/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      // Таймаут 15 секунд
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(
        `RSS Proxy: HTTP ${response.status} ${response.statusText} for ${url}`,
      );
      const errorText = await response
        .text()
        .catch(() => "Unable to read error response");
      console.error(`RSS Proxy: Error details:`, errorText.substring(0, 200));

      return NextResponse.json(
        {
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText.substring(0, 100),
        },
        { status: response.status },
      );
    }

    const content = await response.text();
    console.log(
      `RSS Proxy: Successfully fetched ${content.length} bytes from ${url}`,
    );

    // Проверяем, что контент похож на XML
    if (
      !content.trim().startsWith("<?xml") &&
      !content.trim().startsWith("<rss")
    ) {
      console.warn(`RSS Proxy: Content doesn't look like XML for ${url}`);
      console.warn(`RSS Proxy: Content preview:`, content.substring(0, 200));
    }

    // Возвращаем RSS контент с п��авильными заголовками
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300", // Кешируем на 5 минут
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("RSS Proxy Error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
