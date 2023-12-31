import { Page } from "puppeteer";
import { URL } from "url";
import { basename, extname } from "path";
import * as fs from "fs";

export const downloadSVGFromImg = async (
  page: Page,
  selector: string,
  savePath: string,
  withNevigation: boolean = true
) => {
  await page.waitForSelector(selector);
  const imgData: any = await page.$$(selector);
  let imgSrc = await imgData[0].evaluate((x: any) => x.src);
  const parsedUrl = new URL(imgSrc);
  const fileName = parsedUrl.pathname.split("/").pop();
  const file_name = fileName.replace(extname(basename(parsedUrl.pathname)), "");
  if (withNevigation) {
    await page.goto(imgSrc);
    await page.waitForSelector("svg");
  }
  // Extract the SVG content from the HTML
  const imgSvg = await page.evaluate(() => {
    const svgElement = document.querySelector("svg"); // Change the selector as needed
    return svgElement ? svgElement.outerHTML : null;
  });

  if (imgSvg) {
    // Save the SVG content to a file
    fs.writeFileSync(
      `${savePath}${fileName.replace(/-/g, "_")}`,
      imgSvg,
      "utf-8"
    );
    console.log("SVG downloaded successfully!");
    return file_name;
  } else {
    console.log("SVG not found in the HTML.");
  }
};

export const downloadSVG = async (
  page: Page,
  selector: string,
  savePath: string
) => {
  const svgContent = await page.evaluate((selector) => {
    const svgElement = document.querySelector(selector); // Change the selector as needed
    return svgElement ? svgElement.outerHTML : null;
  }, selector);

  // Check if SVG content is available
  if (svgContent) {
    // Save the SVG content to a file
    fs.writeFileSync(savePath, svgContent, "utf-8");
    console.log("SVG downloaded successfully!");
  } else {
    console.log("SVG not found in the HTML.");
  }
};

export const getTextValue = async (page: Page, selector: string) => {
  const textareaData: any = await page.$$(selector);
  let result = [];
  for (let t of textareaData) {
    let value = await t.evaluate((x: any) => x.value);
    result.push(value);
  }
  return result;
};

export const getParagraphText = async (page: Page, selector: string) => {
  const pData: any = await page.$$(selector);
  let result = [];
  for (let p of pData) {
    let innerText = await p.evaluate((x: any) => x.innerText);
    result.push(innerText);
  }
  return result;
};
/*   



//get items data and save to jsom

const result = await page.evaluate(() => {
    const jsonMgEx = JSON.parse(
    fs.readFileSync("file_to_update.json", "utf-8")
  );
    const exPods = Array.from(document.querySelectorAll(".grid-item"));
    const data: any = {};
    exPods.map((ex: any) => {
      const name = ex.querySelector("h2").innerText;
      data[name.toLowerCase()] = {
        name,
        list: Array.from(ex.querySelectorAll("ul li")).map(
          (i: HTMLElement) => i.innerText
        ),
      };
    });
    return data;
  });
  const updatedJson = JSON.stringify(result, null, 2);
  fs.writeFileSync("file_to_update.json", updatedJson, "utf-8");
  console.log(result); 
  
  
  
  
  */
export const scrollDown = async (page: Page) => {
  let prevHeight: any = -1;
  let maxScrolls = 100;
  let scrollCount = 0;

  while (scrollCount < maxScrolls) {
    // Scroll to the bottom of the page
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    // Wait for page load
    await page.waitForTimeout(1000);
    // Calculate new scroll height and compare
    let newHeight: any = await page.evaluate("document.body.scrollHeight");
    if (newHeight == prevHeight) {
      break;
    }
    prevHeight = newHeight;
    scrollCount += 1;
  }
};

export const writeToJSON = async () => {};
