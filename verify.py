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
    print("Waiting for server to initialize...")
    time.sleep(15) # Increased wait time for server startup

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        await context.clear_cookies()
        page = await context.new_page()
        try:
            print("Navigating to http://localhost:3000")
            await page.goto("http://localhost:3000", timeout=60000)

            # Wait for the auth container to be populated, indicating the Lit SDK has loaded
            print("Waiting for auth container to be populated...")
            await page.wait_for_selector('#authContainer > *', state='visible', timeout=45000)

            # Wait for the guest button to be visible
            print("Waiting for guest button to appear...")
            await page.wait_for_selector('#enterParadiseGuest', state='visible', timeout=30000)

            # Click the guest enter paradise button using its ID
            print("Clicking guest button...")
            await page.click('#enterParadiseGuest')

            # Wait for the new page to load and the canvas to be ready
            print("Waiting for scene to load...")
            await page.wait_for_load_state('networkidle', timeout=60000)

            # Check if the canvas is visible
            print("Verifying canvas visibility...")
            canvas = page.locator('canvas')
            await expect(canvas).to_be_visible(timeout=30000)

            # Take a screenshot
            await page.screenshot(path="screenshot.png")
            print("Screenshot taken successfully!")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="error_screenshot.png")
            print("Error screenshot taken.")
        finally:
            await browser.close()
            # Stop the server
            print("Stopping server...")
            os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
            print("Server stopped.")


asyncio.run(main())
