import postcss from 'postcss';
import assert from 'assert';
import requireUncached from 'require-uncached';

import Plugin from '../../lib/';

const test = (selector, result) => {
    assert.strictEqual(
        postcss([ Plugin ]).process(selector + '{}').css,
        result + '{}'
    );
};

describe('plugin', () => {
    describe('Aliases for start entity', () => {
        it('dot', () => {
            test(
                '.block(foo)',
                '.foo'
            );
        });
        it('colon', () => {
            test(
                ':block(foo)',
                '.foo'
            );
        });
        it('at', () => {
            test(
                '@block(foo)',
                '.foo'
            );
            test(
                '@media',
                '@media'
            );
        });
    });

    describe('block', () => {
        it('simple', () => {
            test(
                'block(block)',
                '.block'
            );
        });

        it('multiple blocks', () => {
            test(
                'block(block1).elem(elem) block(block2)',
                '.block1__elem .block2'
            );
        });

        it('mixed block', () => {
            test(
                'block(block1).elem(elem).block(block2)',
                '.block1__elem.block2'
            );
        });

        it('block name with double quotes', () => {
            test(
                'block("block1") block("block2")',
                '.block1 .block2'
            );
        });

        it('block name with single quotes', () => {
            test(
                'block(\'block1\') block(\'block2\')',
                '.block1 .block2'
            );
        });

        it('with pseudo classes', () => {
            test(
                ':root block(block1).mod(m v):hover::before block(block1):nth-of-type(2)',
                ':root .block1_m_v:hover::before .block1:nth-of-type(2)'
            );
        });

        it('selector with attrs', () => {
            test(
                'block(menu)[class*=\'menu_mode\']',
                '.menu[class*=\'menu_mode\']'
            );
        });

        it('with other tags', () => {
            test(
                'block(block1) div block(bl2) img',
                '.block1 div .bl2 img'
            );
        });
    });

    describe('elem', () => {
        it('simple', () => {
            test(
                'block(block).elem(elem)',
                '.block__elem'
            );
        });

        it('multiple blocks elems', () => {
            test(
                'block(block1).elem(elem1) block(block2).elem(elem2)',
                '.block1__elem1 .block2__elem2'
            );
        });

        it('block multiple short elems', () => {
            test(
                'block(block1).elem(elem1) elem(elem2) elem(elem3)',
                '.block1__elem1 .block1__elem2 .block1__elem3'
            );
        });
    });

    describe('mod', () => {
        describe('block', () => {
            it('block short mod', () => {
                test(
                    'block(block).mod(mod)',
                    '.block_mod'
                );
            });

            it('block multiple short mods', () => {
                test(
                    'block(block).mod(mod).mod(mod2)',
                    '.block_mod.block_mod2'
                );
            });

            it('multiple blocks shorts mods', () => {
                test(
                    'block(block1).mod(mod1) block(block2).mod(mod2)',
                    '.block1_mod1 .block2_mod2'
                );
            });

            it('multiple blocks mods with delimeter "-" in value', () => {
                test(
                    'block(block).mod(mod val-1) block(block).elem(icon)',
                    '.block_mod_val-1 .block__icon'
                );
            });

            it('block mod', () => {
                test(
                    'block(block).mod(mod val)',
                    '.block_mod_val'
                );
            });

            it('block mod with double quotes', () => {
                test(
                    'block("block1").mod("mod", "val")',
                    '.block1_mod_val'
                );
            });

            it('block mod with single quotes', () => {
                test(
                    'block(\'block1\').mod(\'mod\',\'val\')',
                    '.block1_mod_val'
                );
            });

            it('multiple blocks mods', () => {
                test(
                    'block(block1).mod(mod1 val1) block(block2).mod(mod2 val2)',
                    '.block1_mod1_val1 .block2_mod2_val2'
                );
            });

            it('mod val with delimeter "->"', () => {
                test(
                    'block(block1).mod(mod1 -> val1) block(block2).mod("mod2" -> "val2")',
                    '.block1_mod1_val1 .block2_mod2_val2'
                );
            });
        });

        describe('elem', () => {
            it('elem short mod', () => {
                test(
                    'block(block).elem(elem).mod(mod)',
                    '.block__elem_mod'
                );
            });
            it('elem multiple short mods', () => {
                test(
                    'block(block).elem(elem).mod(mod).mod(mod2)',
                    '.block__elem_mod.block__elem_mod2'
                );
            });

            it('multiple elems short mods', () => {
                test(
                    'block(block1).elem(elem1).mod(mod1) block(block2).elem(elem2).mod(mod2)',
                    '.block1__elem1_mod1 .block2__elem2_mod2'
                );
            });

            it('elem mod', () => {
                test(
                    'block(block).elem(elem).mod(mod val)',
                    '.block__elem_mod_val'
                );
            });

            it('multiple elems mods', () => {
                test(
                    'block(block1).elem(elem1).mod(mod1 val1) block(block2).elem(elem2).mod(mod2 val2)',
                    '.block1__elem1_mod1_val1 .block2__elem2_mod2_val2'
                );
            });
        });
    });

    describe('rebem syntax style', () => {
        it('block', () => {
            test(
                ':block(block)',
                '.block'
            );
        });

        it('elem', () => {
            test(
                ':block(block):elem(elem)',
                '.block__elem'
            );
        });

        it('pseudo', () => {
            test(
                ':block(block):after',
                '.block:after'
            );
        });
    });

    describe('custom delimeters', function() {
        it('mods', function() {
            process.env.BEM_MOD_DELIM = '~~';

            const CustomPlugin = requireUncached('../../lib/');

            assert.strictEqual(
                postcss([ CustomPlugin ]).process('block(block).mod(mod val){}').css,
                '.block~~mod~~val{}'
            );
        });

        it('elem', function() {
            process.env.BEM_ELEM_DELIM = '--';

            const CustomPlugin = requireUncached('../../lib/');

            assert.strictEqual(
                postcss([ CustomPlugin ]).process('block(block).elem(elem){}').css,
                '.block--elem{}'
            );
        });
    });
});
