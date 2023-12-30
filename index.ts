console.log("started web scrapping...");
const puppeteer = require("puppeteer");
import { URL } from "url";
import { basename, extname } from "path";
import { Browser, Page } from "puppeteer";
import {
  downloadSVGFromImg,
  downloadSVG,
  getTextValue,
  getParagraphText,
} from "./lib/scrapeUtil";
import * as fs from "fs";

const url = "https://app.someurl.com/auth/login";

const main = async (url: string) => {
  const jsonExercises = JSON.parse(fs.readFileSync("exercises.json", "utf-8"));
  const jsonEn = JSON.parse(fs.readFileSync("en/translation.json", "utf-8"));
  const jsonEs = JSON.parse(fs.readFileSync("es/translation.json", "utf-8"));
  const jsonFr = JSON.parse(fs.readFileSync("fr/translation.json", "utf-8"));
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url);
  await page.waitForSelector("#identifier");
  await page.click("#identifier");
  await page.type("#identifier", "someemail@email.com");

  await page.waitForSelector("#password");
  await page.click("#password");
  await page.type("#password", "somepassword!");

  await page.waitForSelector(
    "body > div.h-full.bg-gradient-to-r.from-cyan-100.to-indigo-100 > div > main > form > div > button"
  );
  await page.click(
    "body > div.h-full.bg-gradient-to-r.from-cyan-100.to-indigo-100 > div > main > form > div > button"
  );
  await page.waitForNavigation();
  const arr = [];
  for (let i = 1; i < 2; i++) {
    if (i !== 93) {
      console.log(i);
      await page.goto(`https://app.someurl.com/exercises/exercise/${i}`);
      await page.waitForSelector(
        "body div.col-span-4.flex.flex-col.gap-6.overflow-y-scroll.pr-6"
      );

      let nameSelector =
        "body div.col-span-4.flex.flex-col.gap-6.overflow-y-scroll.pr-6 > div:nth-child(2) input";
      const nameRes = await getTextValue(page, nameSelector);
      const nameEn = nameRes[0];
      const nameEs = nameRes[1];
      const nameFr = nameRes[2];

      //img download
      let imgSelector = `body img[alt="${nameEn}"]`;
      await page.waitForSelector(imgSelector);
      const exerciseName = await downloadSVGFromImg(
        page,
        imgSelector,
        `exercises/`,
        true
      );

      await page.goto(`https://app.someurl.com/exercises/exercise/${i}`);

      //description
      let descSelector = `
      body div.col-span-4.flex.flex-col.gap-6.overflow-y-scroll.pr-6 > div:nth-child(3) textarea`;
      await page.waitForSelector(descSelector);
      const descriptionRes = await getTextValue(page, descSelector);
      let descriptionEn = descriptionRes[0];
      let descriptionEs = descriptionRes[1];
      let descriptionFr = descriptionRes[2];

      //Starting Position
      let spSelector = `
      body div.col-span-4.flex.flex-col.gap-6.overflow-y-scroll.pr-6 > div:nth-child(4) textarea`;
      await page.waitForSelector(spSelector);
      const spRes = await getTextValue(page, spSelector);
      let spEn = spRes[0];
      let spEs = spRes[1];
      let spFr = spRes[2];

      //Execution
      let exSelector = `
      body div.col-span-4.flex.flex-col.gap-6.overflow-y-scroll.pr-6 > div:nth-child(5) textarea`;
      await page.waitForSelector(exSelector);
      const exRes = await getTextValue(page, exSelector);
      let exEn = exRes[0];
      let exEs = exRes[1];
      let exFr = exRes[2];

      //Muscle Groups
      let mgSelector = `
      body div.flex.flex-col.gap-4.p-5.rounded-md.shadow-sm.bg-white > div:nth-child(3) p`;
      const mgRes = await getParagraphText(page, mgSelector);

      //Equipment required
      let eqrSelector = `
      body div.flex.flex-col.gap-4.p-5.rounded-md.shadow-sm.bg-white > div:nth-child(4) p`;
      const eqrRes = await getParagraphText(page, eqrSelector);
      console.log(eqrRes);

      //muscle groups SVG
      await downloadSVG(
        page,
        "body div:nth-child(7) > svg",
        `exercises/${exerciseName.replace(/-/g, "_")}_muscle_groups.svg`
      );

      //save jsons
      // Modify the existing data (for example, add a new property)
      jsonExercises[exerciseName.replace(/-/g, "_")] = {
        name: nameEn,
        description: descriptionEn,
        starting_position: spEn,
        execution: exEn,
        muscle_groups: mgRes,
        equipment_required: eqrRes,
      };
      jsonEn["exercises"][exerciseName.replace(/-/g, "_")] = {
        name: nameEn,
        description: descriptionEn,
        starting_position: spEn,
        execution: exEn,
      };
      jsonEs["exercises"][exerciseName.replace(/-/g, "_")] = {
        name: nameEs,
        description: descriptionEs,
        starting_position: spEs,
        execution: exEs,
      };
      jsonFr["exercises"][exerciseName.replace(/-/g, "_")] = {
        name: nameFr,
        description: descriptionFr,
        starting_position: spFr,
        execution: exFr,
      };

      // Convert the modified data to a JSON string
      const updatedJsonExercises = JSON.stringify(jsonExercises, null, 2);
      const updatedJsonEn = JSON.stringify(jsonEn, null, 2);
      const updatedJsonEs = JSON.stringify(jsonEs, null, 2);
      const updatedJsonFr = JSON.stringify(jsonFr, null, 2);

      // Write the updated JSON data back to the file
      fs.writeFileSync("exercises.json", updatedJsonExercises, "utf-8");
      fs.writeFileSync("en/translation.json", updatedJsonEn, "utf-8");
      fs.writeFileSync("es/translation.json", updatedJsonEs, "utf-8");
      fs.writeFileSync("fr/translation.json", updatedJsonFr, "utf-8");

      console.log(`JSON data has been updated.`);
      console.log(`Done ex: ${i} - ${nameEn}`);
    }
    console.log("done looping");
  }

  await browser.close();

  console.log("done web scrapping...");
};

main(url);
