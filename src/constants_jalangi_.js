J$.iids = {"nBranches":0,"originalCodeFileName":"/workspaces/nodebb-spring-26-team-f1/src/constants.js","instrumentedCodeFileName":"/workspaces/nodebb-spring-26-team-f1/src/constants_jalangi_.js","code":"'use strict';\n\nconst path = require('path');\n\nconst baseDir = path.join(__dirname, '../');\nconst loader = path.join(baseDir, 'loader.js');\nconst app = path.join(baseDir, 'app.js');\nconst pidfile = path.join(baseDir, 'pidfile');\nconst config = path.join(baseDir, 'config.json');\nconst currentPackage = path.join(baseDir, 'package.json');\nconst installPackage = path.join(baseDir, 'install/package.json');\nconst nodeModules = path.join(baseDir, 'node_modules');\n\nexports.paths = {\n\tbaseDir,\n\tloader,\n\tapp,\n\tpidfile,\n\tconfig,\n\tcurrentPackage,\n\tinstallPackage,\n\tnodeModules,\n};\n\nexports.pluginNamePattern = /^(@[\\w-]+\\/)?nodebb-(theme|plugin|widget|rewards)-[\\w-]+$/;\nexports.themeNamePattern = /^(@[\\w-]+\\/)?nodebb-theme-[\\w-]+$/;\n"};
jalangiLabel0:
    while (true) {
        try {
            J$.Se(609, '/workspaces/nodebb-spring-26-team-f1/src/constants_jalangi_.js', '/workspaces/nodebb-spring-26-team-f1/src/constants.js');
            J$.N(617, 'path', path, 0);
            J$.N(625, 'baseDir', baseDir, 0);
            J$.N(633, 'loader', loader, 0);
            J$.N(641, 'app', app, 0);
            J$.N(649, 'pidfile', pidfile, 0);
            J$.N(657, 'config', config, 0);
            J$.N(665, 'currentPackage', currentPackage, 0);
            J$.N(673, 'installPackage', installPackage, 0);
            J$.N(681, 'nodeModules', nodeModules, 0);
            J$.X1(17, J$.T(9, 'use strict', 21, false));
            const path = J$.X1(57, J$.W(49, 'path', J$.F(41, J$.R(25, 'require', require, 2), 0)(J$.T(33, 'path', 21, false)), path, 3));
            const baseDir = J$.X1(105, J$.W(97, 'baseDir', J$.M(89, J$.R(65, 'path', path, 1), 'join', 0)(J$.R(73, '__dirname', __dirname, 2), J$.T(81, '../', 21, false)), baseDir, 3));
            const loader = J$.X1(153, J$.W(145, 'loader', J$.M(137, J$.R(113, 'path', path, 1), 'join', 0)(J$.R(121, 'baseDir', baseDir, 1), J$.T(129, 'loader.js', 21, false)), loader, 3));
            const app = J$.X1(201, J$.W(193, 'app', J$.M(185, J$.R(161, 'path', path, 1), 'join', 0)(J$.R(169, 'baseDir', baseDir, 1), J$.T(177, 'app.js', 21, false)), app, 3));
            const pidfile = J$.X1(249, J$.W(241, 'pidfile', J$.M(233, J$.R(209, 'path', path, 1), 'join', 0)(J$.R(217, 'baseDir', baseDir, 1), J$.T(225, 'pidfile', 21, false)), pidfile, 3));
            const config = J$.X1(297, J$.W(289, 'config', J$.M(281, J$.R(257, 'path', path, 1), 'join', 0)(J$.R(265, 'baseDir', baseDir, 1), J$.T(273, 'config.json', 21, false)), config, 3));
            const currentPackage = J$.X1(345, J$.W(337, 'currentPackage', J$.M(329, J$.R(305, 'path', path, 1), 'join', 0)(J$.R(313, 'baseDir', baseDir, 1), J$.T(321, 'package.json', 21, false)), currentPackage, 3));
            const installPackage = J$.X1(393, J$.W(385, 'installPackage', J$.M(377, J$.R(353, 'path', path, 1), 'join', 0)(J$.R(361, 'baseDir', baseDir, 1), J$.T(369, 'install/package.json', 21, false)), installPackage, 3));
            const nodeModules = J$.X1(441, J$.W(433, 'nodeModules', J$.M(425, J$.R(401, 'path', path, 1), 'join', 0)(J$.R(409, 'baseDir', baseDir, 1), J$.T(417, 'node_modules', 21, false)), nodeModules, 3));
            J$.X1(537, J$.P(529, J$.R(449, 'exports', exports, 2), 'paths', J$.T(521, {
                baseDir,
                loader,
                app,
                pidfile,
                config,
                currentPackage,
                installPackage,
                nodeModules
            }, 11, false), 0));
            J$.X1(569, J$.P(561, J$.R(545, 'exports', exports, 2), 'pluginNamePattern', J$.T(553, /^(@[\w-]+\/)?nodebb-(theme|plugin|widget|rewards)-[\w-]+$/, 14, false), 0));
            J$.X1(601, J$.P(593, J$.R(577, 'exports', exports, 2), 'themeNamePattern', J$.T(585, /^(@[\w-]+\/)?nodebb-theme-[\w-]+$/, 14, false), 0));
        } catch (J$e) {
            J$.Ex(689, J$e);
        } finally {
            if (J$.Sr(697)) {
                J$.L();
                continue jalangiLabel0;
            } else {
                J$.L();
                break jalangiLabel0;
            }
        }
    }
// JALANGI DO NOT INSTRUMENT
