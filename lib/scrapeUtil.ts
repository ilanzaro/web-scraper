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

export const writeToJSON = async () => {};
