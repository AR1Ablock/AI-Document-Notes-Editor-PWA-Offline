import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

const sitemap = new SitemapStream({ hostname: 'https://nexora-notes-document-maker.web.app/' });

sitemap.write({ url: '/', changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() });
sitemap.write({ url: '/static_preview.html', changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() });

sitemap.end();

streamToPromise(sitemap).then(sm => {
    fs.writeFileSync('public/sitemap.xml', sm.toString());
});

console.log('Sitemap generated!');