module.exports = [
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/apps/login/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40ac18d4440b73a87bbcfd44f6135fcd0ee454367f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signUp"],
    "40b5bdb50a0113ae9b698fc916fd853231c4e9319a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signIn"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$login$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$packages$2f$db$2f$src$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/login/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/apps/login/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$db$2f$src$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/packages/db/src/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"001b1506bf329df299d8d2917a4355f6de246dad77":{"name":"signOut"},"40ac18d4440b73a87bbcfd44f6135fcd0ee454367f":{"name":"signUp"},"40b5bdb50a0113ae9b698fc916fd853231c4e9319a":{"name":"signIn"}},"packages/db/src/actions.ts",""] */ __turbopack_context__.s([
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut,
    "signUp",
    ()=>signUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$insforge$2f$sdk$2f$dist$2f$ssr$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@insforge/sdk/dist/ssr.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function signIn(formData) {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$insforge$2f$sdk$2f$dist$2f$ssr$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuthActions"])({
        cookies: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()
    });
    const { data, error } = await auth.signInWithPassword({
        email: String(formData.get('email')),
        password: String(formData.get('password'))
    });
    return {
        user: data?.user ?? null,
        error
    };
}
async function signUp(formData) {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$insforge$2f$sdk$2f$dist$2f$ssr$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuthActions"])({
        cookies: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()
    });
    const { data, error } = await auth.signUp({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
        name: String(formData.get('name') || '')
    });
    return {
        user: data?.user ?? null,
        error
    };
}
async function signOut() {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$insforge$2f$sdk$2f$dist$2f$ssr$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAuthActions"])({
        cookies: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()
    });
    const { error } = await auth.signOut();
    return {
        error
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    signIn,
    signUp,
    signOut
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signIn, "40b5bdb50a0113ae9b698fc916fd853231c4e9319a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signUp, "40ac18d4440b73a87bbcfd44f6135fcd0ee454367f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signOut, "001b1506bf329df299d8d2917a4355f6de246dad77", null);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__02xe93d._.js.map