from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:4178")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshot_home.png", full_page=True)

    page.get_by_text("进入人形町").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshot_chapters.png", full_page=True)

    page.get_by_text("仙贝店的女孩").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshot_reading.png", full_page=True)

    chapter_ids = [
        "senbei-girl",
        "ryotei-apprentice",
        "ceramics-wife",
        "clock-shop-dog",
        "pastry-clerk",
        "translator-friend",
        "cleaning-president",
        "folk-art-customer",
        "nihonbashi-detective",
    ]
    page.evaluate(
        """ids => {
            localStorage.setItem('newcomer-immersive-progress', JSON.stringify({
                unlockedChapters: ids,
                collectedClues: [],
                currentChapter: 'nihonbashi-detective',
                completedChapters: ids.slice(0, 8)
            }));
        }""",
        chapter_ids,
    )
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_text("CHAPTERS").click()
    page.get_by_text("日本桥的刑警").first.click()
    for _ in range(8):
        page.keyboard.press("Enter")
        page.wait_for_timeout(250)
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshot_credits.png", full_page=True)

    browser.close()
