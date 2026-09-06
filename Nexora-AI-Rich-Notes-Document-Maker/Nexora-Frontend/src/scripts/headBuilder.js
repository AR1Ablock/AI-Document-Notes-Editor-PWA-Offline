import { computed, isRef, unref } from 'vue';

const default_keywords = "notes app, notes maker, document maker, rich text editor, offline notes app, Markdown notes, HTML editor, multimedia notes, media attachments, AI writing, AI notes, AI image generation, voice notes, speech-to-text, text-to-speech, OCR notes, charts, diagrams, workspace notes, PDF export, document editor";

export function buildHead({ title, description, canonical, type = 'website', image, url, jsonLd = null, robots = 'index, follow', keywords = default_keywords }) {
    try {

        const read = (value) => unref(value);

        return computed(() => {
            const _title = read(title) || 'Nexora — Rich Notes & Document Maker';
            const _description = read(description) || '';
            const _url = read(url) || '';
            const _image = read(image) || '';
            const _canonical = read(canonical) || _url;
            const _robots = read(robots) || 'index, follow';
            const _keywords = read(keywords);

            const meta = [
                {
                    name: 'description',
                    content: _description
                },
                {
                    name: 'keywords',
                    content: _keywords
                },
                {
                    name: 'robots',
                    content: _robots
                },

                // Open Graph
                {
                    property: 'og:site_name',
                    content: 'Nexora'
                },
                {
                    property: 'og:type',
                    content: type
                },
                {
                    property: 'og:title',
                    content: _title
                },
                {
                    property: 'og:description',
                    content: _description
                },
                {
                    property: 'og:url',
                    content: _url
                },
                {
                    property: 'og:image',
                    content: _image
                },
                {
                    property: 'og:image:alt',
                    content: 'Nexora — Rich Notes & Document Maker'
                },
                {
                    property: 'og:locale',
                    content: 'en_US'
                },

                // Twitter/X
                {
                    name: 'twitter:card',
                    content: _image ? 'summary_large_image' : 'summary'
                },
                {
                    name: 'twitter:title',
                    content: _title
                },
                {
                    name: 'twitter:description',
                    content: _description
                },
                {
                    name: 'twitter:image',
                    content: _image
                }
            ].filter(
                (meta) =>
                    meta.content !== undefined &&
                    meta.content !== null &&
                    meta.content !== ''
            );

            const link = [
                _canonical
                    ? {
                        rel: 'canonical',
                        href: _canonical
                    }
                    : null,

                {
                    rel: 'icon',
                    href: '/Notes.png',
                    type: 'image/png'
                },

                {
                    rel: 'apple-touch-icon',
                    href: '/Notes.png'
                }
            ].filter(Boolean);

            const script = [];

            if (jsonLd) {
                const structuredData = read(jsonLd);

                script.push({
                    type: 'application/ld+json',
                    children: JSON.stringify(structuredData)
                });
            }

            return {
                title: _title,
                meta,
                link,
                script
            };
        });

    } catch (error) {
        console.log('Error in buildHead function:' + error.message);
    }

}