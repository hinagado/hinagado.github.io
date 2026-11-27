/* このファイルは _offline/make_sw.mjs から生成されます。直接編集しないでください。 */
"use strict";

const CACHE_NAME = "gcm-goto-citymall-demo-786436519a6d";
const CACHE_PREFIX = "gcm-goto-citymall-demo-";
const FONT_CACHE = "gcm-fonts-v1";
const PRE = [
  "access.html",
  "company.html",
  "demo.html",
  "en/access.html",
  "en/",
  "en/index.html",
  "en/shops.html",
  "flyer_view.js",
  "fmap.js",
  "img/access/bus1_s.webp",
  "img/access/bus1.webp",
  "img/access/bus2_s.webp",
  "img/access/bus2.webp",
  "img/access/door_s.webp",
  "img/access/door.webp",
  "img/access/front_s.webp",
  "img/access/front.webp",
  "img/access/nursing1_s.webp",
  "img/access/nursing1.webp",
  "img/access/nursing2_s.webp",
  "img/access/nursing2.webp",
  "img/access/ramp_s.webp",
  "img/access/ramp.webp",
  "img/art_cover.jpg",
  "img/art_hero.jpg",
  "img/art_omiyage.jpg",
  "img/art_rain.jpg",
  "img/art_tsubaki.jpg",
  "img/beauty.jpg",
  "img/boss_b.jpg",
  "img/boss.jpg",
  "img/cafe.jpg",
  "img/fashion.jpg",
  "img/ferry.jpg",
  "img/ferry.webp",
  "img/flyer/bonpati_xmas_1_s.webp",
  "img/flyer/bonpati_xmas_1.webp",
  "img/flyer/bonpati_xmas_2_s.webp",
  "img/flyer/bonpati_xmas_2.webp",
  "img/flyer/demo1.svg",
  "img/flyer/demo2.svg",
  "img/flyer/demo3.svg",
  "img/flyer/mirai_1_s.webp",
  "img/flyer/mirai_1.webp",
  "img/flyer/twopiece_1_s.webp",
  "img/flyer/twopiece_1.webp",
  "img/flyer/twopiece_2_s.webp",
  "img/flyer/twopiece_2.webp",
  "img/flyer/twopiece12_1_s.webp",
  "img/flyer/twopiece12_1.webp",
  "img/flyer/twopiece12_2_s.webp",
  "img/flyer/twopiece12_2.webp",
  "img/fmap/_bk1124n_1f.webp",
  "img/fmap/1f.webp",
  "img/fmap/2f.webp",
  "img/fmap/3f.webp",
  "img/fmap/anim/bus.webp",
  "img/fmap/anim/car_blue.webp",
  "img/fmap/anim/car_red.webp",
  "img/fmap/anim/car_white.webp",
  "img/fmap/anim/car_yellow.webp",
  "img/fmap/anim/e_couple.webp",
  "img/fmap/anim/e_hat.webp",
  "img/fmap/anim/k_balloon.webp",
  "img/fmap/anim/k_bear.webp",
  "img/fmap/anim/k_run.webp",
  "img/fmap/anim/p_bags.webp",
  "img/fmap/anim/p_child.webp",
  "img/fmap/anim/p_elder.webp",
  "img/fmap/anim/p_pack.webp",
  "img/fmap/anim/p_shopbags.webp",
  "img/fmap/anim/p_stroller.webp",
  "img/fmap/anim/p_tote.webp",
  "img/fmap/anim/t_camera.webp",
  "img/fmap/anim/t_case.webp",
  "img/fmap/anim/t_family.webp",
  "img/fmap/anim/taxi.webp",
  "img/food.jpg",
  "img/ig_sheet.jpg",
  "img/ig1.jpg",
  "img/ig2.jpg",
  "img/ig3.jpg",
  "img/ig4.jpg",
  "img/kids.jpg",
  "img/living.jpg",
  "img/logo_s1.webp",
  "img/logo_s10.webp",
  "img/logo_s11.webp",
  "img/logo_s12.webp",
  "img/logo_s13.webp",
  "img/logo_s14.webp",
  "img/logo_s15.webp",
  "img/logo_s16.webp",
  "img/logo_s17.webp",
  "img/logo_s19.webp",
  "img/logo_s2.webp",
  "img/logo_s20.webp",
  "img/logo_s24.webp",
  "img/logo_s25.webp",
  "img/logo_s28.webp",
  "img/logo_s29.webp",
  "img/logo_s30.webp",
  "img/logo_s32.webp",
  "img/logo_s35.webp",
  "img/logo_s37.webp",
  "img/logo_s38.webp",
  "img/logo_s4.webp",
  "img/logo_s6.webp",
  "img/logo_s7.webp",
  "img/logo_s8.webp",
  "img/logo_s9.webp",
  "img/logo.png",
  "img/mall.jpg",
  "img/menu/blossom_01_s.webp",
  "img/menu/blossom_01.webp",
  "img/menu/blossom_02_s.webp",
  "img/menu/blossom_02.webp",
  "img/menu/blossom_03_s.webp",
  "img/menu/blossom_03.webp",
  "img/menu/blossom_04_s.webp",
  "img/menu/blossom_04.webp",
  "img/menu/blossom_05_s.webp",
  "img/menu/blossom_05.webp",
  "img/menu/blossom_06_s.webp",
  "img/menu/blossom_06.webp",
  "img/menu/blossom_07_s.webp",
  "img/menu/blossom_07.webp",
  "img/menu/blossom_08_s.webp",
  "img/menu/blossom_08.webp",
  "img/menu/blossom_09_s.webp",
  "img/menu/blossom_09.webp",
  "img/menu/blossom_10_s.webp",
  "img/menu/blossom_10.webp",
  "img/menu/blossom_11_s.webp",
  "img/menu/blossom_11.webp",
  "img/menu/blossom_12_s.webp",
  "img/menu/blossom_12.webp",
  "img/menu/blossom_13_s.webp",
  "img/menu/blossom_13.webp",
  "img/menu/marufuku_01_s.webp",
  "img/menu/marufuku_01.webp",
  "img/menu/marufuku_02_s.webp",
  "img/menu/marufuku_02.webp",
  "img/menu/marufuku_03_s.webp",
  "img/menu/marufuku_03.webp",
  "img/menu/marufuku_04_s.webp",
  "img/menu/marufuku_04.webp",
  "img/qr-1f-info.png",
  "img/qr-2f-esc.png",
  "img/qr-3f-south.png",
  "img/service.jpg",
  "img/shii_front.webp",
  "img/shii_wink.webp",
  "img/shop/s1_1_s.webp",
  "img/shop/s1_1.webp",
  "img/shop/s1_2_s.webp",
  "img/shop/s1_2.webp",
  "img/shop/s1_3_s.webp",
  "img/shop/s1_3.webp",
  "img/shop/s1_4_s.webp",
  "img/shop/s1_4.webp",
  "img/shop/s1_5_s.webp",
  "img/shop/s1_5.webp",
  "img/shop/s1_6_s.webp",
  "img/shop/s1_6.webp",
  "img/shop/s10_1_s.webp",
  "img/shop/s10_1.webp",
  "img/shop/s10_2_s.webp",
  "img/shop/s10_2.webp",
  "img/shop/s10_3_s.webp",
  "img/shop/s10_3.webp",
  "img/shop/s10_4_s.webp",
  "img/shop/s10_4.webp",
  "img/shop/s10_5_s.webp",
  "img/shop/s10_5.webp",
  "img/shop/s11_1_s.webp",
  "img/shop/s11_1.webp",
  "img/shop/s11_2_s.webp",
  "img/shop/s11_2.webp",
  "img/shop/s11_3_s.webp",
  "img/shop/s11_3.webp",
  "img/shop/s11_4_s.webp",
  "img/shop/s11_4.webp",
  "img/shop/s12_1_s.webp",
  "img/shop/s12_1.webp",
  "img/shop/s12_2_s.webp",
  "img/shop/s12_2.webp",
  "img/shop/s12_3_s.webp",
  "img/shop/s12_3.webp",
  "img/shop/s12_4_s.webp",
  "img/shop/s12_4.webp",
  "img/shop/s13_1_s.webp",
  "img/shop/s13_1.webp",
  "img/shop/s13_2_s.webp",
  "img/shop/s13_2.webp",
  "img/shop/s13_3_s.webp",
  "img/shop/s13_3.webp",
  "img/shop/s13_4_s.webp",
  "img/shop/s13_4.webp",
  "img/shop/s13_5_s.webp",
  "img/shop/s13_5.webp",
  "img/shop/s13_6_s.webp",
  "img/shop/s13_6.webp",
  "img/shop/s14_1_s.webp",
  "img/shop/s14_1.webp",
  "img/shop/s14_2_s.webp",
  "img/shop/s14_2.webp",
  "img/shop/s14_3_s.webp",
  "img/shop/s14_3.webp",
  "img/shop/s14_4_s.webp",
  "img/shop/s14_4.webp",
  "img/shop/s14_5_s.webp",
  "img/shop/s14_5.webp",
  "img/shop/s14_6_s.webp",
  "img/shop/s14_6.webp",
  "img/shop/s15_1_s.webp",
  "img/shop/s15_1.webp",
  "img/shop/s15_2_s.webp",
  "img/shop/s15_2.webp",
  "img/shop/s15_3_s.webp",
  "img/shop/s15_3.webp",
  "img/shop/s15_4_s.webp",
  "img/shop/s15_4.webp",
  "img/shop/s15_5_s.webp",
  "img/shop/s15_5.webp",
  "img/shop/s16_1_s.webp",
  "img/shop/s16_1.webp",
  "img/shop/s16_2_s.webp",
  "img/shop/s16_2.webp",
  "img/shop/s16_3_s.webp",
  "img/shop/s16_3.webp",
  "img/shop/s16_4_s.webp",
  "img/shop/s16_4.webp",
  "img/shop/s17_1_s.webp",
  "img/shop/s17_1.webp",
  "img/shop/s17_2_s.webp",
  "img/shop/s17_2.webp",
  "img/shop/s17_3_s.webp",
  "img/shop/s17_3.webp",
  "img/shop/s17_4_s.webp",
  "img/shop/s17_4.webp",
  "img/shop/s17_5_s.webp",
  "img/shop/s17_5.webp",
  "img/shop/s17_6_s.webp",
  "img/shop/s17_6.webp",
  "img/shop/s18_1_s.webp",
  "img/shop/s18_1.webp",
  "img/shop/s18_2_s.webp",
  "img/shop/s18_2.webp",
  "img/shop/s18_3_s.webp",
  "img/shop/s18_3.webp",
  "img/shop/s18_4_s.webp",
  "img/shop/s18_4.webp",
  "img/shop/s18_5_s.webp",
  "img/shop/s18_5.webp",
  "img/shop/s18_6_s.webp",
  "img/shop/s18_6.webp",
  "img/shop/s19_1_s.webp",
  "img/shop/s19_1.webp",
  "img/shop/s19_2_s.webp",
  "img/shop/s19_2.webp",
  "img/shop/s19_3_s.webp",
  "img/shop/s19_3.webp",
  "img/shop/s19_4_s.webp",
  "img/shop/s19_4.webp",
  "img/shop/s19_5_s.webp",
  "img/shop/s19_5.webp",
  "img/shop/s2_1_s.webp",
  "img/shop/s2_1.webp",
  "img/shop/s2_2_s.webp",
  "img/shop/s2_2.webp",
  "img/shop/s2_3_s.webp",
  "img/shop/s2_3.webp",
  "img/shop/s2_4_s.webp",
  "img/shop/s2_4.webp",
  "img/shop/s2_5_s.webp",
  "img/shop/s2_5.webp",
  "img/shop/s2_6_s.webp",
  "img/shop/s2_6.webp",
  "img/shop/s20_1_s.webp",
  "img/shop/s20_1.webp",
  "img/shop/s20_2_s.webp",
  "img/shop/s20_2.webp",
  "img/shop/s20_3_s.webp",
  "img/shop/s20_3.webp",
  "img/shop/s20_4_s.webp",
  "img/shop/s20_4.webp",
  "img/shop/s21_1_s.webp",
  "img/shop/s21_1.webp",
  "img/shop/s21_2_s.webp",
  "img/shop/s21_2.webp",
  "img/shop/s21_3_s.webp",
  "img/shop/s21_3.webp",
  "img/shop/s21_4_s.webp",
  "img/shop/s21_4.webp",
  "img/shop/s21_5_s.webp",
  "img/shop/s21_5.webp",
  "img/shop/s22_1_s.webp",
  "img/shop/s22_1.webp",
  "img/shop/s22_2_s.webp",
  "img/shop/s22_2.webp",
  "img/shop/s22_3_s.webp",
  "img/shop/s22_3.webp",
  "img/shop/s22_4_s.webp",
  "img/shop/s22_4.webp",
  "img/shop/s22_5_s.webp",
  "img/shop/s22_5.webp",
  "img/shop/s22_6_s.webp",
  "img/shop/s22_6.webp",
  "img/shop/s23_1_s.webp",
  "img/shop/s23_1.webp",
  "img/shop/s23_2_s.webp",
  "img/shop/s23_2.webp",
  "img/shop/s23_3_s.webp",
  "img/shop/s23_3.webp",
  "img/shop/s24_1_s.webp",
  "img/shop/s24_1.webp",
  "img/shop/s24_2_s.webp",
  "img/shop/s24_2.webp",
  "img/shop/s24_3_s.webp",
  "img/shop/s24_3.webp",
  "img/shop/s24_4_s.webp",
  "img/shop/s24_4.webp",
  "img/shop/s24_5_s.webp",
  "img/shop/s24_5.webp",
  "img/shop/s25_1_s.webp",
  "img/shop/s25_1.webp",
  "img/shop/s25_2_s.webp",
  "img/shop/s25_2.webp",
  "img/shop/s25_3_s.webp",
  "img/shop/s25_3.webp",
  "img/shop/s26_1_s.webp",
  "img/shop/s26_1.webp",
  "img/shop/s27_1_s.webp",
  "img/shop/s27_1.webp",
  "img/shop/s27_2_s.webp",
  "img/shop/s27_2.webp",
  "img/shop/s27_3_s.webp",
  "img/shop/s27_3.webp",
  "img/shop/s27_4_s.webp",
  "img/shop/s27_4.webp",
  "img/shop/s28_1_s.webp",
  "img/shop/s28_1.webp",
  "img/shop/s28_2_s.webp",
  "img/shop/s28_2.webp",
  "img/shop/s28_3_s.webp",
  "img/shop/s28_3.webp",
  "img/shop/s28_4_s.webp",
  "img/shop/s28_4.webp",
  "img/shop/s29_1_s.webp",
  "img/shop/s29_1.webp",
  "img/shop/s29_2_s.webp",
  "img/shop/s29_2.webp",
  "img/shop/s29_3_s.webp",
  "img/shop/s29_3.webp",
  "img/shop/s3_1_s.webp",
  "img/shop/s3_1.webp",
  "img/shop/s3_2_s.webp",
  "img/shop/s3_2.webp",
  "img/shop/s3_3_s.webp",
  "img/shop/s3_3.webp",
  "img/shop/s3_4_s.webp",
  "img/shop/s3_4.webp",
  "img/shop/s3_5_s.webp",
  "img/shop/s3_5.webp",
  "img/shop/s30_1_s.webp",
  "img/shop/s30_1.webp",
  "img/shop/s30_2_s.webp",
  "img/shop/s30_2.webp",
  "img/shop/s30_3_s.webp",
  "img/shop/s30_3.webp",
  "img/shop/s30_4_s.webp",
  "img/shop/s30_4.webp",
  "img/shop/s30_5_s.webp",
  "img/shop/s30_5.webp",
  "img/shop/s32_1_s.webp",
  "img/shop/s32_1.webp",
  "img/shop/s32_2_s.webp",
  "img/shop/s32_2.webp",
  "img/shop/s32_3_s.webp",
  "img/shop/s32_3.webp",
  "img/shop/s32_4_s.webp",
  "img/shop/s32_4.webp",
  "img/shop/s32_5_s.webp",
  "img/shop/s32_5.webp",
  "img/shop/s32_6_s.webp",
  "img/shop/s32_6.webp",
  "img/shop/s33_1_s.webp",
  "img/shop/s33_1.webp",
  "img/shop/s33_2_s.webp",
  "img/shop/s33_2.webp",
  "img/shop/s33_3_s.webp",
  "img/shop/s33_3.webp",
  "img/shop/s33_4_s.webp",
  "img/shop/s33_4.webp",
  "img/shop/s33_5_s.webp",
  "img/shop/s33_5.webp",
  "img/shop/s33_6_s.webp",
  "img/shop/s33_6.webp",
  "img/shop/s35_1_s.webp",
  "img/shop/s35_1.webp",
  "img/shop/s35_2_s.webp",
  "img/shop/s35_2.webp",
  "img/shop/s35_3_s.webp",
  "img/shop/s35_3.webp",
  "img/shop/s35_4_s.webp",
  "img/shop/s35_4.webp",
  "img/shop/s36_1_s.webp",
  "img/shop/s36_1.webp",
  "img/shop/s36_2_s.webp",
  "img/shop/s36_2.webp",
  "img/shop/s36_3_s.webp",
  "img/shop/s36_3.webp",
  "img/shop/s37_1_s.webp",
  "img/shop/s37_1.webp",
  "img/shop/s37_2_s.webp",
  "img/shop/s37_2.webp",
  "img/shop/s37_3_s.webp",
  "img/shop/s37_3.webp",
  "img/shop/s37_4_s.webp",
  "img/shop/s37_4.webp",
  "img/shop/s37_5_s.webp",
  "img/shop/s37_5.webp",
  "img/shop/s4_1_s.webp",
  "img/shop/s4_1.webp",
  "img/shop/s4_2_s.webp",
  "img/shop/s4_2.webp",
  "img/shop/s4_3_s.webp",
  "img/shop/s4_3.webp",
  "img/shop/s4_4_s.webp",
  "img/shop/s4_4.webp",
  "img/shop/s4_5_s.webp",
  "img/shop/s4_5.webp",
  "img/shop/s5_1_s.webp",
  "img/shop/s5_1.webp",
  "img/shop/s5_2_s.webp",
  "img/shop/s5_2.webp",
  "img/shop/s5_3_s.webp",
  "img/shop/s5_3.webp",
  "img/shop/s5_4_s.webp",
  "img/shop/s5_4.webp",
  "img/shop/s5_5_s.webp",
  "img/shop/s5_5.webp",
  "img/shop/s5_6_s.webp",
  "img/shop/s5_6.webp",
  "img/shop/s6_1_s.webp",
  "img/shop/s6_1.webp",
  "img/shop/s6_2_s.webp",
  "img/shop/s6_2.webp",
  "img/shop/s6_3_s.webp",
  "img/shop/s6_3.webp",
  "img/shop/s6_4_s.webp",
  "img/shop/s6_4.webp",
  "img/shop/s6_5_s.webp",
  "img/shop/s6_5.webp",
  "img/shop/s6_6_s.webp",
  "img/shop/s6_6.webp",
  "img/shop/s7_1_s.webp",
  "img/shop/s7_1.webp",
  "img/shop/s7_2_s.webp",
  "img/shop/s7_2.webp",
  "img/shop/s7_3_s.webp",
  "img/shop/s7_3.webp",
  "img/shop/s7_4_s.webp",
  "img/shop/s7_4.webp",
  "img/shop/s7_5_s.webp",
  "img/shop/s7_5.webp",
  "img/shop/s8_1_s.webp",
  "img/shop/s8_1.webp",
  "img/shop/s8_2_s.webp",
  "img/shop/s8_2.webp",
  "img/shop/s8_3_s.webp",
  "img/shop/s8_3.webp",
  "img/shop/s8_4_s.webp",
  "img/shop/s8_4.webp",
  "img/shop/s8_5_s.webp",
  "img/shop/s8_5.webp",
  "img/shop/s9_1_s.webp",
  "img/shop/s9_1.webp",
  "img/shop/s9_2_s.webp",
  "img/shop/s9_2.webp",
  "img/shop/s9_3_s.webp",
  "img/shop/s9_3.webp",
  "img/shop/s9_4_s.webp",
  "img/shop/s9_4.webp",
  "img/sweets.jpg",
  "./",
  "index.html",
  "intl.js",
  "ko/access.html",
  "ko/",
  "ko/index.html",
  "ko/shops.html",
  "lb.js",
  "news.html",
  "opennow.js",
  "polish_a.css",
  "polish_b.css",
  "posts.js",
  "recruit.html",
  "search.js",
  "sheet.js",
  "shops.html",
  "site.css",
  "site.js",
  "style.css",
  "top.js",
  "zh-hant/access.html",
  "zh-hant/",
  "zh-hant/index.html",
  "zh-hant/shops.html"
];
const META_URL = new URL("__meta", self.registration.scope).href;
const OFFLINE_HTML = "<!doctype html><html lang=\"ja\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>オフライン</title><body><p>電波がありません。この画面はまだ保存されていません</p></body></html>";

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchForInstall(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) return response;
      lastError = new Error("HTTP " + response.status + ": " + url);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await wait(300 * (attempt + 1));
  }
  throw lastError || new Error("取得できませんでした: " + url);
}

async function installAll() {
  const cache = await caches.open(CACHE_NAME);
  let wasAlreadyReady = false;
  try {
    const oldMeta = await cache.match(META_URL);
    // __meta は全件保存後にだけ書くため、これがあれば旧版は完成済み。
    wasAlreadyReady = !!oldMeta;
  } catch (_) {
    wasAlreadyReady = false;
  }
  let next = 0;
  const failures = [];

  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= PRE.length) return;
      const url = PRE[index];
      try {
        const response = await fetchForInstall(url);
        await cache.put(url, response);
      } catch (error) {
        failures.push({ url: url, error: error });
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(6, PRE.length); i += 1) workers.push(worker());
  await Promise.all(workers);

  // 1件でも欠けたキャッシュは準備済みにせず、丸ごと捨てる。
  if (failures.length) {
    // 同一内容の完成済み旧版がある場合は、当日使える保存を壊さない。
    if (!wasAlreadyReady) await caches.delete(CACHE_NAME);
    throw failures[0].error;
  }

  const at = new Date().toISOString();
  await cache.put(
    META_URL,
    new Response(JSON.stringify({ at: at }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    })
  );
  await self.skipWaiting();
}

self.addEventListener("install", function (event) {
  event.waitUntil(installAll());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return false;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function hasSecretKey(url) {
  try {
    return new URL(url).searchParams.has("k");
  } catch (_) {
    return true;
  }
}

async function saveLocal(request, response) {
  if (!response || !response.ok || response.type !== "basic" || hasSecretKey(request.url)) return;
  try {
    // 呼び出し直後に複製し、画面へ返した応答との読み取り競合を避ける。
    const copy = response.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, copy);
  } catch (_) {
    // 容量不足などでも、取得できた画面そのものは返す。
  }
}

async function findLocal(request) {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);
  if (!response) response = await cache.match(request, { ignoreSearch: true });
  return response;
}

function pageNetworkFirst(event) {
  const request = event.request;
  const fetched = fetch(request);
  const update = fetched.then(
    function (response) {
      return saveLocal(request, response);
    },
    function () {}
  );
  const network = fetched.then(
    function (response) { return { kind: "network", response: response }; },
    function () { return { kind: "error" }; }
  );

  // 保存版を返した後も通信を完了させ、次回用の内容を更新する。
  event.waitUntil(update);

  return Promise.race([
    network,
    wait(4000).then(function () { return { kind: "timeout" }; }),
  ]).then(async function (result) {
    if (result.kind === "network") return result.response;
    const cached = await findLocal(request);
    if (cached) return cached;
    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}

function assetCacheFirst(event) {
  const request = event.request;
  const network = fetch(request);
  const update = network.then(
    function (response) { return saveLocal(request, response); },
    function () {}
  );

  // 保存版が見つかった場合も、裏側では最新版を取りに行く。
  event.waitUntil(update);
  return findLocal(request).then(function (cached) {
    if (cached) return cached;
    return network;
  });
}

async function fontCacheFirst(request) {
  const cache = await caches.open(FONT_CACHE);
  const mayStore = !hasSecretKey(request.url);
  const corsRequest = new Request(request.url, {
    mode: "cors",
    credentials: "omit",
  });
  const cached = mayStore ? await cache.match(corsRequest) : null;
  if (cached) return cached;

  try {
    const response = await fetch(corsRequest);
    if (response.ok && mayStore) {
      try {
        await cache.put(corsRequest, response.clone());
      } catch (_) {}
    }
    return response;
  } catch (_) {
    // CORS で取り直せない場合は、ブラウザ本来の取得方法へ戻す。
    return fetch(request);
  }
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(fontCacheFirst(request));
    return;
  }

  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || url.href.indexOf(scope.href) !== 0) return;

  const accept = request.headers.get("accept") || "";
  const isPage = request.mode === "navigate" || accept.indexOf("text/html") !== -1;
  if (isPage) {
    event.respondWith(pageNetworkFirst(event));
  } else {
    event.respondWith(assetCacheFirst(event));
  }
});

self.addEventListener("message", function (event) {
  if (!event.data || event.data.type !== "check" || !event.ports || !event.ports[0]) return;
  const port = event.ports[0];

  (async function () {
    let have = 0;
    let at = null;
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const url of PRE) {
        if (await cache.match(url)) have += 1;
      }
      const meta = await cache.match(META_URL);
      if (meta) {
        const data = await meta.json();
        if (data && typeof data.at === "string") at = data.at;
      }
    } catch (_) {}

    port.postMessage({
      ok: have === PRE.length && !!at,
      have: have,
      total: PRE.length,
      cache: CACHE_NAME,
      at: at,
    });
  })();
});
