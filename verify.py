import asyncio
import os
import signal
import subprocess
import time
from playwright.async_api import async_playwright, expect

async def main():
    # Kill any process on port 3000
    try:
        subprocess.run("kill -9 $(lsof -t -i:3000)", shell=True, check=True)
        print("Killed process on port 3000")
    except subprocess.CalledProcessError:
        print("No process to kill on port 3000")

    # Start the server
    server_process = subprocess.Popen(
        "npm run start:dev",
        shell=True,
        preexec_fn=os.setsid
    )
    print("Started server")

    # Wait for the server to be ready
    time.sleep(10)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto("http://localhost:3000")

            # Click the load paradise button
            await page.click('text="Load Paradise"')

            # Wait for the new page to load
            await page.wait_for_load_state('networkidle')

            # Check if the canvas is visible
            canvas = page.locator('canvas')
            await expect(canvas).to_be_visible()

            # Take a screenshot
            await page.screenshot(path="screenshot.png")
            print("Screenshot taken")

        finally:
            await browser.close()
            # Stop the server
            os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
            print("Stopped server")


asyncio.run(main())
