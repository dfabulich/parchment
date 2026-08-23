/*

Parchment Launcher for Inform 7
===============================

Copyright (c) 2026 Dannii Willis
MIT licenced
https://github.com/curiousdannii/parchment

*/

import {Blorb, fetch_resource, FileView, is_iOS, utf8encoder} from '../upstream/asyncglk/src/index-browser.js'
import {default as Bocfel} from 'emglken/build/bocfel-noz6.js'
import {default as Glulxe} from 'emglken/build/glulxe.js'
import type {EmglkenEngine, EmglkenEngineOptions, StoryOptions} from '../common/interface.js'
import {get_default_options, get_query_options} from '../common/options.js'

import LoadingPane from '../common/ui/LoadingPane.svelte'
import './inform7.css'

interface Inform7ParchmentOptions extends EmglkenEngineOptions {
    story: StoryOptions,
}

interface ParchmentWindow extends Window {
    parchment_options?: Inform7ParchmentOptions
}
declare let window: ParchmentWindow

async function launch() {
    const options: Inform7ParchmentOptions = Object.assign({}, get_default_options(), window.parchment_options, get_query_options(['do_vm_autosave']))

    if (!options.story) {
        return options.GlkOte.error('No storyfile specified')
    }

    // Update the Dialog storage version
    await options.Dialog.init(options)

    // Break out of an iframe
    const is_in_iframe = window.self !== window.top
    if (is_in_iframe && !options.play_in_iframe) {
        const cover_image_url = $('#loadingpane img').attr('src')!
        $('#loadingpane').remove()
        const gameport = document.getElementById('gameport')!

        let new_tab: WindowProxy | undefined
        const load = () => {
            // If we've already opened a new tab, focus it (except in iOS where it doesn't work)
            if (new_tab && !new_tab.closed && !is_iOS) {
                new_tab.focus()
            }
            else {
                new_tab = window.open(document.URL)!
            }
            // It would be nice to exit Itch's maximised mode here, but I can't work out how to safely do so on both mobile and desktop
            return
        }

        new LoadingPane({
            target: gameport,
            props: {
                cover_image_url,
                play: load,
                title: options.story.title!,
            },
        })
        return
    }

    // Discriminate
    const format = (/\.(zblorb|zlb|z3|z4|z5|z8)$/.test(options.story.filename!)) ? 'zcode' : 'glulx'

    const resources = [
        format === 'zcode' ? 'bocfel-noz6.js' : 'glulxe.js',
        options.story.url!,
    ]
    const resource_map = options.story.resource_map
    if (resource_map && !resource_map.startsWith('[')) {
        resources.push('jsresourcemap.js')
    }
    const requires: any[] = await Promise.all(resources.map(path => fetch_resource(options, path)))
    const wasmBinary: Uint8Array<ArrayBuffer> = requires[0]
    const story_data: Uint8Array<ArrayBuffer> = requires[1]

    try {
        options.arguments = [await options.Dialog.upload(options.story.filename!, story_data)]
        const view = new FileView(story_data)
        if (view.getFourCC(0) === 'FORM' && view.getFourCC(8) === 'IFRS') {
            options.Blorb = new Blorb(story_data)
        }
        else if (requires[2]) {
            options.Blorb = new Blorb(requires[2])
            const resource_map_data = utf8encoder.encode(JSON.stringify(requires[2]))
            options.arguments.push('-resourcemap', await options.Dialog.upload(options.story.filename! + '.resourcemap.json', resource_map_data, false))
        }

        const engine = format === 'zcode' ? Bocfel : Glulxe
        const vm: EmglkenEngine = await engine({wasmBinary}) as EmglkenEngine
        vm.start(options)
    }
    catch (err) {
        options.GlkOte.error(err)
    }
}

$(launch)