/*

Common Parchment Options
========================

Copyright (c) 2022 Dannii Willis
MIT licenced
https://github.com/curiousdannii/parchment

*/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Dialog from '../upstream/glkote/dialog.js'
import {GlkOte, GlkOteOptions} from '../upstream/asyncglk/src/glkote/common/glkote.js'
import WebGlkOte from '../upstream/asyncglk/src/glkote/web/web.js'

type ParchmentTruthy = boolean | number

export interface ParchmentOptions extends Partial<GlkOteOptions> {
    // Parchment options

    /** Whether or not to automatically launch Parchment */
    auto_launch?: ParchmentTruthy,
    /** Story path in the array format traditionally used by Parchment for Inform 7 */
    default_story?: [string],
    /** Domains to access directly: should always have both Access-Control-Allow-Origin and compression headers */
    direct_domains: string[],
    /** Path to resources */
    lib_path: string,
    /** URL of Proxy */
    proxy_url: string,
    /** Whether to load embeded resources in single file mode */
    single_file?: ParchmentTruthy,
    /** Story path */
    story?: string,
    /** Theme name, can be set to 'dark */
    theme?: string,
    /** Name of theme cookie to check */
    theme_cookie: string,
    /** Disable the file proxy, which may mean that some files can't be loaded */
    use_proxy?: ParchmentTruthy,

    // Modules to pass to other modules

    /** Dialog instance to use */
    Dialog: any,
    /** GlkOte instance to use */
    GlkOte: GlkOte,

    // Common options for VMs

    /** Whether or not to load an autosave */
    do_vm_autosave?: ParchmentTruthy,
}

export default function get_default_options(): ParchmentOptions {
    return {
        auto_launch: 1,
        Dialog,
        direct_domains: [
            'unbox.ifarchive.org',
        ],
        do_vm_autosave: 1,
        GlkOte: new WebGlkOte(),
        lib_path: 'dist/web/',
        proxy_url: 'https://proxy.iplayif.com/proxy/',
        theme_cookie: 'parchment_theme',
        use_proxy: 1,
    }
}