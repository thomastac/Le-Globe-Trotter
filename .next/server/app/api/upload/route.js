"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/upload/route";
exports.ids = ["app/api/upload/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_admin_Documents_Voyage_d_etude_GlobTrotter_GlobeTrotter_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/upload/route.ts */ \"(rsc)/./app/api/upload/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/upload/route\",\n        pathname: \"/api/upload\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\admin\\\\Documents\\\\Voyage d'etude\\\\GlobTrotter\\\\GlobeTrotter\\\\app\\\\api\\\\upload\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_admin_Documents_Voyage_d_etude_GlobTrotter_GlobeTrotter_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/upload/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhZG1pbiU1Q0RvY3VtZW50cyU1Q1ZveWFnZSUyMGQnZXR1ZGUlNUNHbG9iVHJvdHRlciU1Q0dsb2JlVHJvdHRlciU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDYWRtaW4lNUNEb2N1bWVudHMlNUNWb3lhZ2UlMjBkJ2V0dWRlJTVDR2xvYlRyb3R0ZXIlNUNHbG9iZVRyb3R0ZXImaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ2tEO0FBQy9IO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2xvYmV0cm90dGVyLz8zN2FmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGFkbWluXFxcXERvY3VtZW50c1xcXFxWb3lhZ2UgZCdldHVkZVxcXFxHbG9iVHJvdHRlclxcXFxHbG9iZVRyb3R0ZXJcXFxcYXBwXFxcXGFwaVxcXFx1cGxvYWRcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3VwbG9hZC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3VwbG9hZFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXBsb2FkL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcYWRtaW5cXFxcRG9jdW1lbnRzXFxcXFZveWFnZSBkJ2V0dWRlXFxcXEdsb2JUcm90dGVyXFxcXEdsb2JlVHJvdHRlclxcXFxhcHBcXFxcYXBpXFxcXHVwbG9hZFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvdXBsb2FkL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/upload/route.ts":
/*!*********************************!*\
  !*** ./app/api/upload/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   dynamic: () => (/* binding */ dynamic),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabaseAdmin */ \"(rsc)/./lib/supabaseAdmin.ts\");\n\n\nconst runtime = \"nodejs\";\nconst dynamic = \"force-dynamic\";\n// POST /api/upload\n// Expects multipart/form-data with field \"file\"\nasync function POST(req) {\n    try {\n        const contentType = req.headers.get(\"content-type\") || \"\";\n        if (!contentType.includes(\"multipart/form-data\")) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Content-Type must be multipart/form-data\"\n            }, {\n                status: 400\n            });\n        }\n        const form = await req.formData();\n        const file = form.get(\"file\");\n        if (!file) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Missing file\"\n            }, {\n                status: 400\n            });\n        }\n        const supabase = (0,_lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.getSupabaseAdmin)();\n        // Ensure bucket exists\n        const bucket = \"photos\";\n        const { data: buckets } = await supabase.storage.listBuckets();\n        const exists = buckets?.some((b)=>b.name === bucket);\n        if (!exists) {\n            await supabase.storage.createBucket(bucket, {\n                public: true\n            });\n        }\n        const arrayBuffer = await file.arrayBuffer();\n        const bytes = new Uint8Array(arrayBuffer);\n        // Build a unique path\n        const ext = (file.name.split(\".\").pop() || \"jpg\").toLowerCase();\n        const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;\n        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, bytes, {\n            contentType: file.type || \"image/jpeg\",\n            upsert: false\n        });\n        if (uploadError) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: uploadError.message\n            }, {\n                status: 500\n            });\n        }\n        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);\n        const publicUrl = publicUrlData.publicUrl;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            url: publicUrl,\n            path: `${bucket}/${filePath}`\n        });\n    } catch (e) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: e?.message || \"Upload failed\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3VwbG9hZC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUEyQztBQUNZO0FBRWhELE1BQU1FLFVBQVUsU0FBUztBQUN6QixNQUFNQyxVQUFVLGdCQUFnQjtBQUV2QyxtQkFBbUI7QUFDbkIsZ0RBQWdEO0FBQ3pDLGVBQWVDLEtBQUtDLEdBQVk7SUFDckMsSUFBSTtRQUNGLE1BQU1DLGNBQWNELElBQUlFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLG1CQUFtQjtRQUN2RCxJQUFJLENBQUNGLFlBQVlHLFFBQVEsQ0FBQyx3QkFBd0I7WUFDaEQsT0FBT1QscURBQVlBLENBQUNVLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUEyQyxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDaEc7UUFFQSxNQUFNQyxPQUFPLE1BQU1SLElBQUlTLFFBQVE7UUFDL0IsTUFBTUMsT0FBT0YsS0FBS0wsR0FBRyxDQUFDO1FBQ3RCLElBQUksQ0FBQ08sTUFBTTtZQUNULE9BQU9mLHFEQUFZQSxDQUFDVSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBZSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDcEU7UUFFQSxNQUFNSSxXQUFXZixvRUFBZ0JBO1FBRWpDLHVCQUF1QjtRQUN2QixNQUFNZ0IsU0FBUztRQUNmLE1BQU0sRUFBRUMsTUFBTUMsT0FBTyxFQUFFLEdBQUcsTUFBTUgsU0FBU0ksT0FBTyxDQUFDQyxXQUFXO1FBQzVELE1BQU1DLFNBQVNILFNBQVNJLEtBQUssQ0FBQ0MsSUFBV0EsRUFBRUMsSUFBSSxLQUFLUjtRQUNwRCxJQUFJLENBQUNLLFFBQVE7WUFDWCxNQUFNTixTQUFTSSxPQUFPLENBQUNNLFlBQVksQ0FBQ1QsUUFBUTtnQkFBRVUsUUFBUTtZQUFLO1FBQzdEO1FBRUEsTUFBTUMsY0FBYyxNQUFNYixLQUFLYSxXQUFXO1FBQzFDLE1BQU1DLFFBQVEsSUFBSUMsV0FBV0Y7UUFFN0Isc0JBQXNCO1FBQ3RCLE1BQU1HLE1BQU0sQ0FBQ2hCLEtBQUtVLElBQUksQ0FBQ08sS0FBSyxDQUFDLEtBQUtDLEdBQUcsTUFBTSxLQUFJLEVBQUdDLFdBQVc7UUFDN0QsTUFBTUMsV0FBVyxDQUFDLEVBQUVDLEtBQUtDLEdBQUcsR0FBRyxDQUFDLEVBQUVDLEtBQUtDLE1BQU0sR0FBR0MsUUFBUSxDQUFDLElBQUlDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRVYsSUFBSSxDQUFDO1FBRTlFLE1BQU0sRUFBRXBCLE9BQU8rQixXQUFXLEVBQUUsR0FBRyxNQUFNMUIsU0FBU0ksT0FBTyxDQUFDdUIsSUFBSSxDQUFDMUIsUUFBUTJCLE1BQU0sQ0FBQ1QsVUFBVU4sT0FBTztZQUN6RnZCLGFBQWFTLEtBQUs4QixJQUFJLElBQUk7WUFDMUJDLFFBQVE7UUFDVjtRQUNBLElBQUlKLGFBQWE7WUFDZixPQUFPMUMscURBQVlBLENBQUNVLElBQUksQ0FBQztnQkFBRUMsT0FBTytCLFlBQVlLLE9BQU87WUFBQyxHQUFHO2dCQUFFbkMsUUFBUTtZQUFJO1FBQ3pFO1FBRUEsTUFBTSxFQUFFTSxNQUFNOEIsYUFBYSxFQUFFLEdBQUdoQyxTQUFTSSxPQUFPLENBQUN1QixJQUFJLENBQUMxQixRQUFRZ0MsWUFBWSxDQUFDZDtRQUMzRSxNQUFNZSxZQUFZRixjQUFjRSxTQUFTO1FBRXpDLE9BQU9sRCxxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQUV5QyxLQUFLRDtZQUFXRSxNQUFNLENBQUMsRUFBRW5DLE9BQU8sQ0FBQyxFQUFFa0IsU0FBUyxDQUFDO1FBQUM7SUFDM0UsRUFBRSxPQUFPa0IsR0FBUTtRQUNmLE9BQU9yRCxxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQUVDLE9BQU8wQyxHQUFHTixXQUFXO1FBQWdCLEdBQUc7WUFBRW5DLFFBQVE7UUFBSTtJQUNuRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2xvYmV0cm90dGVyLy4vYXBwL2FwaS91cGxvYWQvcm91dGUudHM/YTg4ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBnZXRTdXBhYmFzZUFkbWluIH0gZnJvbSAnQC9saWIvc3VwYWJhc2VBZG1pbic7XG5cbmV4cG9ydCBjb25zdCBydW50aW1lID0gJ25vZGVqcyc7XG5leHBvcnQgY29uc3QgZHluYW1pYyA9ICdmb3JjZS1keW5hbWljJztcblxuLy8gUE9TVCAvYXBpL3VwbG9hZFxuLy8gRXhwZWN0cyBtdWx0aXBhcnQvZm9ybS1kYXRhIHdpdGggZmllbGQgXCJmaWxlXCJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVxLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICBpZiAoIWNvbnRlbnRUeXBlLmluY2x1ZGVzKCdtdWx0aXBhcnQvZm9ybS1kYXRhJykpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnQ29udGVudC1UeXBlIG11c3QgYmUgbXVsdGlwYXJ0L2Zvcm0tZGF0YScgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3JtID0gYXdhaXQgcmVxLmZvcm1EYXRhKCk7XG4gICAgY29uc3QgZmlsZSA9IGZvcm0uZ2V0KCdmaWxlJykgYXMgRmlsZSB8IG51bGw7XG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ01pc3NpbmcgZmlsZScgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdXBhYmFzZSA9IGdldFN1cGFiYXNlQWRtaW4oKTtcblxuICAgIC8vIEVuc3VyZSBidWNrZXQgZXhpc3RzXG4gICAgY29uc3QgYnVja2V0ID0gJ3Bob3Rvcyc7XG4gICAgY29uc3QgeyBkYXRhOiBidWNrZXRzIH0gPSBhd2FpdCBzdXBhYmFzZS5zdG9yYWdlLmxpc3RCdWNrZXRzKCk7XG4gICAgY29uc3QgZXhpc3RzID0gYnVja2V0cz8uc29tZSgoYjogYW55KSA9PiBiLm5hbWUgPT09IGJ1Y2tldCk7XG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIGF3YWl0IHN1cGFiYXNlLnN0b3JhZ2UuY3JlYXRlQnVja2V0KGJ1Y2tldCwgeyBwdWJsaWM6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XG5cbiAgICAvLyBCdWlsZCBhIHVuaXF1ZSBwYXRoXG4gICAgY29uc3QgZXh0ID0gKGZpbGUubmFtZS5zcGxpdCgnLicpLnBvcCgpIHx8ICdqcGcnKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gYCR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX0uJHtleHR9YDtcblxuICAgIGNvbnN0IHsgZXJyb3I6IHVwbG9hZEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5zdG9yYWdlLmZyb20oYnVja2V0KS51cGxvYWQoZmlsZVBhdGgsIGJ5dGVzLCB7XG4gICAgICBjb250ZW50VHlwZTogZmlsZS50eXBlIHx8ICdpbWFnZS9qcGVnJyxcbiAgICAgIHVwc2VydDogZmFsc2UsXG4gICAgfSk7XG4gICAgaWYgKHVwbG9hZEVycm9yKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogdXBsb2FkRXJyb3IubWVzc2FnZSB9LCB7IHN0YXR1czogNTAwIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZGF0YTogcHVibGljVXJsRGF0YSB9ID0gc3VwYWJhc2Uuc3RvcmFnZS5mcm9tKGJ1Y2tldCkuZ2V0UHVibGljVXJsKGZpbGVQYXRoKTtcbiAgICBjb25zdCBwdWJsaWNVcmwgPSBwdWJsaWNVcmxEYXRhLnB1YmxpY1VybDtcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHVybDogcHVibGljVXJsLCBwYXRoOiBgJHtidWNrZXR9LyR7ZmlsZVBhdGh9YCB9KTtcbiAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGU/Lm1lc3NhZ2UgfHwgJ1VwbG9hZCBmYWlsZWQnIH0sIHsgc3RhdHVzOiA1MDAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTdXBhYmFzZUFkbWluIiwicnVudGltZSIsImR5bmFtaWMiLCJQT1NUIiwicmVxIiwiY29udGVudFR5cGUiLCJoZWFkZXJzIiwiZ2V0IiwiaW5jbHVkZXMiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJmb3JtIiwiZm9ybURhdGEiLCJmaWxlIiwic3VwYWJhc2UiLCJidWNrZXQiLCJkYXRhIiwiYnVja2V0cyIsInN0b3JhZ2UiLCJsaXN0QnVja2V0cyIsImV4aXN0cyIsInNvbWUiLCJiIiwibmFtZSIsImNyZWF0ZUJ1Y2tldCIsInB1YmxpYyIsImFycmF5QnVmZmVyIiwiYnl0ZXMiLCJVaW50OEFycmF5IiwiZXh0Iiwic3BsaXQiLCJwb3AiLCJ0b0xvd2VyQ2FzZSIsImZpbGVQYXRoIiwiRGF0ZSIsIm5vdyIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwidXBsb2FkRXJyb3IiLCJmcm9tIiwidXBsb2FkIiwidHlwZSIsInVwc2VydCIsIm1lc3NhZ2UiLCJwdWJsaWNVcmxEYXRhIiwiZ2V0UHVibGljVXJsIiwicHVibGljVXJsIiwidXJsIiwicGF0aCIsImUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/upload/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabaseAdmin.ts":
/*!******************************!*\
  !*** ./lib/supabaseAdmin.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseAdmin: () => (/* binding */ getSupabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n// Server-side Supabase client (Service Role). We avoid throwing at module import\n// to prevent Next.js from rendering an HTML error page that the client cannot parse as JSON.\nfunction getSupabaseAdmin() {\n    const supabaseUrl = \"https://lvsipwcikfriwhrhzzmg.supabase.co\";\n    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\n    if (!supabaseUrl) {\n        throw new Error(\"Missing env NEXT_PUBLIC_SUPABASE_URL\");\n    }\n    if (!supabaseServiceKey) {\n        throw new Error(\"Missing env SUPABASE_SERVICE_ROLE_KEY (server only)\");\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseServiceKey, {\n        auth: {\n            persistSession: false,\n            autoRefreshToken: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2VBZG1pbi50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUFxRTtBQUVyRSxpRkFBaUY7QUFDakYsNkZBQTZGO0FBQ3RGLFNBQVNDO0lBQ2QsTUFBTUMsY0FBY0MsMENBQW9DO0lBQ3hELE1BQU1HLHFCQUFxQkgsUUFBUUMsR0FBRyxDQUFDRyx5QkFBeUI7SUFFaEUsSUFBSSxDQUFDTCxhQUFhO1FBQ2hCLE1BQU0sSUFBSU0sTUFBTTtJQUNsQjtJQUNBLElBQUksQ0FBQ0Ysb0JBQW9CO1FBQ3ZCLE1BQU0sSUFBSUUsTUFBTTtJQUNsQjtJQUVBLE9BQU9SLG1FQUFZQSxDQUFDRSxhQUFhSSxvQkFBb0I7UUFDbkRHLE1BQU07WUFBRUMsZ0JBQWdCO1lBQU9DLGtCQUFrQjtRQUFNO0lBQ3pEO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nbG9iZXRyb3R0ZXIvLi9saWIvc3VwYWJhc2VBZG1pbi50cz8wOWQ1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCwgU3VwYWJhc2VDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuXG4vLyBTZXJ2ZXItc2lkZSBTdXBhYmFzZSBjbGllbnQgKFNlcnZpY2UgUm9sZSkuIFdlIGF2b2lkIHRocm93aW5nIGF0IG1vZHVsZSBpbXBvcnRcbi8vIHRvIHByZXZlbnQgTmV4dC5qcyBmcm9tIHJlbmRlcmluZyBhbiBIVE1MIGVycm9yIHBhZ2UgdGhhdCB0aGUgY2xpZW50IGNhbm5vdCBwYXJzZSBhcyBKU09OLlxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlQWRtaW4oKTogU3VwYWJhc2VDbGllbnQge1xuICBjb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHN1cGFiYXNlU2VydmljZUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIGlmICghc3VwYWJhc2VVcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZW52IE5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCcpO1xuICB9XG4gIGlmICghc3VwYWJhc2VTZXJ2aWNlS2V5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGVudiBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIChzZXJ2ZXIgb25seSknKTtcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlU2VydmljZUtleSwge1xuICAgIGF1dGg6IHsgcGVyc2lzdFNlc3Npb246IGZhbHNlLCBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSB9LFxuICB9KTtcbn1cbiJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJnZXRTdXBhYmFzZUFkbWluIiwic3VwYWJhc2VVcmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwic3VwYWJhc2VTZXJ2aWNlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsIkVycm9yIiwiYXV0aCIsInBlcnNpc3RTZXNzaW9uIiwiYXV0b1JlZnJlc2hUb2tlbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabaseAdmin.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5CDocuments%5CVoyage%20d'etude%5CGlobTrotter%5CGlobeTrotter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();