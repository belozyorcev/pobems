import postcss from 'postcss';

const modDelim = process.env.BEM_MOD_DELIM || '_';
const elemDelim = process.env.BEM_ELEM_DELIM || '__';

function buildSelector (ctx, mod) {
    let selector = '.';

    if (ctx.blockName) {
        selector += ctx.blockName;
    }
    if (ctx.elemName) {
        selector += elemDelim + ctx.elemName;
    }
    if (mod) {
        selector += modDelim + mod;

        return selector;
    }

    return selector;
}

export default postcss.plugin('pobem', () => (css) => {
    css.walkAtRules(/block|elem|mod/, function (rule) {
        rule.replaceWith(postcss.rule({
            selector: rule.name + rule.params,
            nodes: rule.nodes,
            raws: rule.raws,
            source: rule.source
        }));
    });
    css.walkRules((rule) => {
        rule.selector = rule.selector
            .replace(/[.:]?(block\(.+)/g, (match, raw) => {
                // "block(b1).elem(elem).mod(mod)" -> "block(b1) elem(elem) mod(mod)"
                const rawSelector = raw
                    .replace(/[.:]?(block|elem|mod)(\([\s\w'"\->,]+\))/g, '=b=$1$2=b=')
                    .replace(/block(\([\s\w'"\->,]+\))=b=\s*=b=(elem|mod)/g, 'block$1=b=$2')
                    .replace(/elem(\([\s\w'"\->,]+\))=b=\s*=b=(mod)/g, 'elem$1=b=$2')
                    .replace(/mod(\([\s\w'"\->,]+\))=b=\s*=b=(mod)/g, 'mod$1=b=$2');

                // "block(b) mod(m v) div block(b2)" -> ["block(b)", "mod(m v)", "div", "block(b2)"]
                const groups = rawSelector.split('=b=');

                const declBemRegex = /(block|elem|mod)\((['",\w->\s]+)\)/g;

                // Convert all groups to CSS selectors
                // block(b) mod(m v) -> .b_m_v

                const ctx = { blockName: false, elemName: false };
                let requiredBuild = false;
                const result = [];

                for (const group of groups) {
                    if (!group.match(declBemRegex)) {
                        requiredBuild ? result.push(buildSelector(ctx)) : '';
                        result.push(group);
                        continue;
                    }
                    const mathes = declBemRegex.exec(group);
                    const _tag = 1;
                    const _value = 2;
                    const tag = mathes[_tag];
                    const value = mathes[_value] ?
                      mathes[_value].replace(/([\(\)'"])/g, '').trim() : false;


                    if (tag === 'block') {
                        requiredBuild = true;
                        ctx.elemName = false;
                        ctx.blockName = value;
                        continue;
                    }

                    if (tag === 'elem') {
                        requiredBuild = true;
                        ctx.elemName = value;
                        continue;
                    }

                    if (tag === 'mod') {
                        requiredBuild = false;
                        const mod = value.replace(/(\s?->\s?|,\s?|\s+?)/g, modDelim);

                        result.push(buildSelector(ctx, mod));
                        continue;
                    }
                    requiredBuild = false;
                }

                return result.join('');
            });
    });
});
