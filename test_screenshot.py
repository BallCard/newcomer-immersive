from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:4177")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshot_home.png", full_page=True)

    page.get_by_text("进入人形町").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshot_chapters.png", full_page=True)

    page.get_by_text("仙贝店的女孩").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshot_reading.png", full_page=True)

    browser.close()
