/**
 * Universal text-file detector (browser File/Blob).
 *
 * - Fast checks: file.type (text/*), known application/* and text/x/* sets, extension map
 * - Fallback: sample bytes -> null-byte quick reject, printable-char ratio check
 * - Extensible: add to MIMES or EXTENSIONS arrays
 *
 * Usage: await isTextFile(file) -> true/false
 */

export async function isTextFile(drop_file, {
    sampleSize = 4096,     // how many bytes to sample for content check
    printableThreshold = 0.90, // fraction of printable chars required to call "text"
} = {}) {
    let blob;
    let ab;
    let view;
    try {
        const file = drop_file;
        if (!file) return false;

        // 1) Quick: any text/*
        if (file.type && file.type.startsWith("text/")) return true;

        // 2) Large curated list of known text-based application/* and text/x-* MIME types
        const KNOWN_TEXT_MIMES = new Set([
            /* application/* text-like */
            "application/json",
            "application/xml",
            "application/javascript",
            "application/ecmascript",
            "application/ld+json",
            "application/wasm", // note: wasm is binary but sometimes mislabelled; we DON'T include it
            /* programming & script types (common application variants) */
            "application/x-python",
            "application/x-python-code",
            "application/x-java",
            "application/x-java-source",
            "application/x-c",
            "application/x-csrc",
            "application/x-c++",
            "application/x-c++src",
            "application/x-csharp",
            "application/x-go",
            "application/x-rust",
            "application/x-kotlin",
            "application/x-ruby",
            "application/x-php",
            "application/x-perl",
            "application/x-lua",
            "application/x-scala",
            "application/x-swift",
            "application/x-typescript",
            "application/x-shellscript",
            "application/x-sh",
            "application/x-bash",
            "application/x-zsh",
            "application/x-powershell",

            /* configs, markup, docs */
            "application/x-yaml",
            "application/x-toml",
            "application/x-ini",
            "application/x-env",
            "application/x-properties",
            "application/x-config",
            "application/x-sql",
            "application/x-latex",
            "application/x-markdown",
            "application/x-rst",
            "application/x-asciidoc",
            "application/x-graphql",

            /* styles, templates */
            "application/x-scss",
            "application/x-sass",
            "application/x-less",
            "application/x-handlebars",
            "application/x-ejs",
            "application/x-mustache",
            "application/x-twig",
            "application/x-liquid",

            /* web frameworks / single-file components */
            "text/x-vue",        // some servers use text/*
            "text/x-svelte",
            "text/x-jsx",
            "text/x-tsx",

            /* logs */
            "application/x-log",

            /* fallback additional variants */
            "application/x-httpd-php",
            "application/x-shellscript",
            "application/x-perl",
        ]);

        if (file.type && KNOWN_TEXT_MIMES.has(file.type)) return true;

        // 3) Extension-based whitelist (many programming languages + config formats)
        //    Add extensions here as needed. Map values are lowercased without dot.
        const TEXT_EXTENSIONS = new Set([
            // common source code
            "js", "mjs", "cjs", "c", "cpp", "cc", "cxx", "h", "hpp", "hxx", "cs", "java", "py", "go", "rs", "kt", "kts", "swift", "scala", "rb", "php", "pl", "pm", "r", "jl", "dart", "ts", "tsx", "jsx", "vb",

            // markup & web
            "html", "htm", "xhtml", "css", "scss", "sass", "less", "xml", "xsd", "xsl", "svg", "json", "yaml", "yml", "toml", "md", "markdown", "rst", "adoc", "asciidoc", "mdown",

            // shell & scripts
            "sh", "bash", "zsh", "ksh", "ps1", "psm1", "command", "bat", "cmd",

            // database / queries
            "sql", "pgsql", "psql", "cql",

            // config / ini / env
            "ini", "env", "cfg", "conf", "cnf", "properties", "toml", "yml", "yaml", ".editorconfig",

            // templates and framework components
            "vue", "svelte", "jsx", "tsx", "ejs", "hbs", "hogan", "mustache", "twig", "liquid", "njk", "nunjucks", "handlebars", "erb", "haml", "pug", "jade", "tpl", "tmpl", "dot",

            // docs
            "tex", "bib", "docbook", "man", "1", "2", "3", "mdoc", "pod",

            // other code-ish formats
            "makefile", "mk", "dockerfile", "tf", "terraform", "tfvars", "psm1", "psd1",
            "gradle", "pom", "pom.xml", "sbt", "gemspec", "gemfile",

            // logs and plain text
            "log", "txt", "text", "readme"
        ].map(ext => ext.replace(/^\./, "").toLowerCase()));

        // helper: get extension from filename
        const name = (file.name || "").toLowerCase();
        const extMatch = name.match(/\.([^.]+)$/);
        if (extMatch) {
            const ext = extMatch[1];
            if (TEXT_EXTENSIONS.has(ext)) return true;
        } else {
            // special cases: filenames like "Makefile", "Dockerfile"
            const basename = name.split("/").pop();
            const specialNames = new Set([
                "makefile", "dockerfile", "gemfile", "gradle", "license", "readme", "rakefile"
            ]);
            if (specialNames.has(basename)) return true;
        }

        // 4) CONTENT-BASED FALLBACK (sample first N bytes)
        //    - reject quickly on null bytes
        //    - compute printable ratio to avoid mislabelled binaries
        blob = file.slice(0, sampleSize);
        ab = await blob.arrayBuffer();
        view = new Uint8Array(ab);
        if (view.length === 0) return true; // empty file - treat as text

        // quick null-byte scan (binary signal)
        for (let i = 0; i < view.length; i++) {
            if (view[i] === 0) return false; // contains null -> very likely binary
        }

        // printable characters heuristic
        // allow: HT(9), LF(10), CR(13), space..~ (32..126), and common UTF-8 multi-byte bytes (>127)
        let printable = 0;
        for (let i = 0; i < view.length; i++) {
            const b = view[i];
            if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126) || b >= 128) {
                printable++;
            }
        }
        const ratio = printable / view.length;

        return ratio >= printableThreshold;
    } catch (error) {
        console.log("Error in isTextFile:", error);
    }
    finally {
        blob = null;
        ab = null;
        view = null;
    }

}