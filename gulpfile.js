
// ----------------------------------------------------------------------
// ∴ Gulp Imports.
// ----------------------------------------------------------------------

const gulp = require('gulp');
      cssnano = require('gulp-cssnano');
      sass = require('gulp-sass');
      concat = require('gulp-concat');
      sourcemaps = require('gulp-sourcemaps');
      hash = require('gulp-hash-filename');
      clean = require('gulp-clean');
      runSequence = require('run-sequence');
      uglify = require('gulp-uglify');
      tsc = require('gulp-typescript');
      babel = require('gulp-babel');
      rollup = require('gulp-better-rollup');
      babel2 = require('rollup-plugin-babel');
      color = require('gulp-color');
      cmd = require('child_process').exec;
      plumber = require('gulp-plumber');
      replace = require('gulp-replace');
      browserify = require('browserify');
      source = require('vinyl-source-stream');
      buffer = require('vinyl-buffer');
      rename = require('gulp-rename');
      fs = require("fs");
      devColor = "GREEN";
      prodColor = "CYAN";

      global.stringConfigurator = '';



// ----------------------------------------------------------------------
// ∴ Build configuration.
// ----------------------------------------------------------------------

// Create build configuration based on argument conditions.
// 1st parameter: 'Development Environment', can be set to 'production', or 'development'.
// 1st parameter: 'Use Angular Compiler', can be set to 'true', or 'false'.
// 1st parameter: 'Use Watch', can be set to 'true', or 'false'. This is always disabled in prod.
// This MUST be set under the 'config' flag of package.json located in the root directory of nFrame.

const config = {
    environment: '',
    useAngular: '',
    watch: '',
    useNgRecompiler: true,
    useNEngine: false
};




// ----------------------------------------------------------------------
// ∴ Path Variables.
// ----------------------------------------------------------------------

const   cssDest                 =      './nStatic/css';
        cssBundleName           =      'bundle.css';
        jsDest                  =      './nStatic/js';
        jsBundleName            =      'bundle.js';
        cssBundleLocal          =      `${cssDest}/${cssBundleName}`;
        jsBundleLocal           =      `${jsDest}/${jsBundleName}`;
        sassSource              =      './webStyle/**/**/*.scss';
        sassBase                =       [
                                            './webStyle/_libraries/bootstrap/bootstrap',
                                            './webStyle/_abstracts/*.scss',
                                            './webStyle/_themes/*.scss',
                                            './webStyle/_base/*.scss',
                                            './webStyle/_components/*.scss',
                                            './webStyle/_blocks/*.scss',
                                            './webStyle/_pages/*.scss',
                                            './webStyle/main.scss',
                                        ];
        tsSource                =      './webTS/**/*.ts';
        jsSource                =      './webJS/**/*.js';
        tsCompilerOuts          =      './webTS/_compiler/**/*.ts';
        jsCompilerOuts          =      './webTS/_compiler/**/*.js';
        compilerEs6Out          =      './webTS/_compiler/es6_out';
        jsFolderCapture         =      './webTS/**/*.js';
        es6TranspileCapture     =      './webTS/_compiler/es6_out/**/*.js';
        jQSource                =      './node_modules/jquery/dist/jquery.min.js';
        compilerEs5Out          =      './webTS/_compiler/es5_out';
        mainEs5Capture          =      './webTS/_compiler/es5_out/main-ts.js';
        mainEs5JSCapture        =      './webTS/_compiler/es5_out/main-js.js';
        crossAppJsCapture       =      './webApp/src/**/**/*.js';
        webAppDistOut           =      './webApp/dist/**/*.*';
        preBundleJsAsset        =      `${jsDest}/main-ts.js`;
        preBundleVanillaJSAsset =      `${jsDest}/main-js.js`;
        staticLocals            =      `${jsDest}/*.js`;
        karma                   =      './webApp/src/karma.conf.js';


// ----------------------------------------------------------------------
// ∴ Install nFrame
// ----------------------------------------------------------------------

        gulp.task('nframe-install', function() {

            console.log(color(`

            ∴ Installing nFrame

        `, 'YELLOW'))

            const fileLists = {
                tsFileList: fs.readdirSync('./webTS/_source'),
                blockFileList: fs.readdirSync('./webStyle/_blocks'),
                pageFileList: fs.readdirSync('./webStyle/_pages')
            }

            const anchors = [ '// IMPORT_TS_BASE', '// IMPORT_BLOCK_BASE', '// IMPORT_PAGE_BASE' ];

            const imports = {
                blocks: '',
                pages: '',
                scripts: ''
            }

            let initialiserFunctions = '';

            const relationshipBuilder = (fileStack) => {
                Object.keys(fileStack).forEach((anchor, i) => {
                    fileStack[anchor].forEach((listItem) => {
                        switch (anchors[i]) {
                            case '// IMPORT_TS_BASE': 
                                const tsElement = listItem.substring(
                                    listItem.lastIndexOf("_") + 1,
                                    listItem.lastIndexOf("-component.ts")
                                )
                                if (!config.useNEngine === true && tsElement.includes('nEngine')) {
                                } else {
                                    imports.scripts = imports.scripts.concat(`import { ${tsElement}Component } from './_source/_${tsElement}-component'; \n`);
                                }
                                if (!tsElement.includes('nEngine')) {
                                    initialiserFunctions = initialiserFunctions.concat(`\n    if (document.querySelector('.container--${tsElement}')) {\n         new ${tsElement}Component(); \n     }; \n`);
                                }
                            break;
                            case '// IMPORT_BLOCK_BASE':
                                    const blockElement = listItem.substring(
                                        listItem.lastIndexOf("_") + 1,
                                        listItem.lastIndexOf(".scss")
                                    )
                                    imports.blocks = imports.blocks.concat(`@import './_blocks/${blockElement}'; \n`);
                            break;
                            case '// IMPORT_PAGE_BASE':
                                    const pageElement = listItem.substring(
                                        listItem.lastIndexOf("_") + 1,
                                        listItem.lastIndexOf(".scss")
                                    )
                                    imports.pages = imports.pages.concat(`@import './_pages/${pageElement}'; \n`);
                            break;
                        }
                    })
                })
            }

            relationshipBuilder(fileLists);

            const nEngineConfigCheck = (scripts, functions) => {
                switch (config.useNEngine) {
                    case false:
                        return mainComponentSansnEngine(scripts, functions);
                    break;
                    case true: 
                        return mainComponentWithnEngine(scripts, functions);
                    break;
                }
            };
            const mainComponentWithnEngine = (scripts, functions) => {
                return `
// Automatic Imports
// These imports are installed by nFrame automatically.
${scripts}

// Manual Imports.
// Place all manual imports below this line.


class MainComponent extends nEngineComponent {
    constructor() {
        super();
    }

    
    // Call all Normal TS/JS classes using render().
    render() {

       // Declare functional classes here.
       ${functions}

    }

    // Page action hooks.
    // Returned Object must match syntax below. 
    // Duration indicates the length of the animation played.
    // Action is the called animation action, the duration callback must match the duration property.

    // Fire when link is clicked, for triggering loading animations.
    onNavigate(): any {
        return {
            duration: 500,
            action: () => {
                (<HTMLElement>document.querySelector('.lds-roller')).style.display = "block";
                $('.lds-roller').animate({
                    opacity: '1'
                }, 500);
            }
        }
    };

    // Fire when request is complete, for removing loading animations.
    onNavigateComplete(): any {
        return {
            duration: 500,
            action: () => {
                const localSet = () => {
                    (<HTMLElement>document.querySelector('.lds-roller')).style.display = "none";
                }
                $('.lds-roller').animate({
                    opacity: '0'
                }, 500, function() {
                    localSet();
                });
            }
        }
    }

    // Fire when onNavigateComplete is done, used for triggering transitions between views.
    // Populates page content with new data from AJAX.
    onPageLoad(): any {
        return {
            duration: 500,
            action: () => {
                $('.page-transition').animate({
                    opacity: '1',
                    width: '100%',
                    marginLeft: '0%'
                }, 500, 'swing')
            }
        }
    }

    // Fire when onPageLoad() has finished, used for completing transitions.
    onPageLoadComplete(): any {
        return {
            duration: 500,
            action: () => {
                $('.page-transition').animate({
                    opacity: '1',
                    width: '0%',
                    marginLeft: '100%'
                }, 500, 'swing').promise().then(() => {
                    $('.page-transition').animate({
                        opacity: '1',
                        width: '0%',
                        marginLeft: '0%'
                    }, 500)
                })
            }
        }
    }

}`};
            const mainComponentSansnEngine = (scripts, functions) => { 
                return `
// Automatic Imports
// These imports are installed by nFrame automatically.
${scripts}

// Manual Imports.
// Place all manual imports below this line.


class MainComponent {

    constructor() {
        this.init();
    }

    public init()  {

        ${functions}

    }

}`};

            gulp.src(['./webTS/main-ts.ts'])
            .pipe(replace(anchors[0], (anchors[0] = '') + nEngineConfigCheck(imports.scripts, initialiserFunctions)))
            .pipe(gulp.dest('./webTS'))

            gulp.src(['./webStyle/main.scss'])
            .pipe(replace(anchors[1], (anchors[1] = '// Block Imports.\n') + imports.blocks))
            .pipe(replace(anchors[2], (anchors[2] = '// Page Imports.\n') + imports.pages))
            .pipe(gulp.dest('./webStyle'))

            console.log(color(`

            ∴ nFrame Installation Complete.

        `, 'YELLOW'))

        });


// ----------------------------------------------------------------------
// ∴ Capture NPM build command and execute paths based on selection.
// ----------------------------------------------------------------------

gulp.task('development-true-false', function() {
    config.environment = 'development';
    config.useAngular = true;
    config.watch = false;
    developmentBuild();
}) 

gulp.task('development-false-false', function() {
    config.environment = 'development';
    config.useAngular = false;
    config.watch = false;
    developmentBuild();
}) 

gulp.task('development-true-true', function() {
    config.environment = 'development';
    config.useAngular = true;
    config.watch = true;
        console.log(color(`
        ---------------------------------------

        ∴ nFrame Development Build Initialised.
        ∴ Watching: Angular & SCSS Changes.

        ---------------------------------------`,
        'YELLOW'));
    gulp.start('build-angular-watch'),
    gulp.watch(sassSource, ['sassDevBuild'])
}) 

gulp.task('development-false-true', function() {
    config.environment = 'development';
    config.useAngular = false;
    config.watch = true;
        console.log(color(`
        ---------------------------------------
        
        ∴ nFrame Development Build Initialised.
        ∴ Watching: TypeScript & SCSS Changes.

        ---------------------------------------`,
        'YELLOW'));
    gulp.watch(tsSource, ['buildDevTypeScript']),
    gulp.watch(jsSource, ['buildDevTypeScript']),
    gulp.watch(sassSource, ['sassDevBuild'])
}) 

gulp.task('production-true-false', function() {
    config.environment = 'production';
    config.useAngular = true;
    config.watch = false;
    productionBuild();
}) 

gulp.task('production-false-false', function() {
    config.environment = 'production';
    config.useAngular = false;
    config.watch = false;
    productionBuild();
}) 

gulp.task('production-true-true', function() {
    console.log(color(`
    ---------------------------------------
    
    ∴ Watch cannot be initialised on production build.

    ---------------------------------------`
    , 'RED'));
}) 

gulp.task('production-false-true', function() {
    console.log(color(`
    ---------------------------------------
    
    ∴ Watch cannot be initialised on production build.

    ---------------------------------------`
    , 'RED'));
}) 



// ----------------------------------------------------------------------
// ∴ Initialise compiler method path.
// ----------------------------------------------------------------------

const developmentBuild = function() {
    let compilerType;
    switch (config.useAngular) {
        case true:
        compilerType = color("Angular Compiler", 'RED');
        console.log(color(`
        ---------------------------------------
        
        ∴ nFrame Development Build Initialised.
        ∴ Compiler type: ${compilerType}`,
        devColor));
        console.log(color(`
        ---------------------------------------
        `, devColor));
        gulp.start('buildDevAngular');
        break;
        case false:
        compilerType = color("TypeScript Compiler", 'YELLOW');
        console.log(color(`
        ---------------------------------------
        
        ∴ nFrame Development Build Initialised.
        ∴ Compiler type: ${compilerType}`,
        devColor));
        console.log(color(`
        ---------------------------------------
        `, devColor));
        gulp.start('buildDevTypeScript');
        break;
    }
}

const productionBuild = function() {
    let compilerType;
    switch (config.useAngular) {
        case true:
        compilerType = color("Angular Compiler", 'RED');
        console.log(color(`
        ---------------------------------------
        
        ∴ nFrame Production Build Initialised.
        ∴ Compiler type: ${compilerType}`,
        prodColor));
        console.log(color(`
        ---------------------------------------
        `, prodColor));
        gulp.start('buildProdAngular');
        break;
        case false:
        compilerType = color("TypeScript Compiler", 'YELLOW');
        console.log(color(`
        ---------------------------------------
        
        ∴ nFrame Production Build Initialised.
        ∴ Compiler type: ${compilerType}`,
        prodColor));
        console.log(color(`
        ---------------------------------------
        `, prodColor));
        gulp.start('buildProdTypeScript');
        break;
    }
}


// ----------------------------------------------------------------------
// ∴ Build front-end for Development.
// ----------------------------------------------------------------------



// With Angular Compiler.
gulp.task('buildDevAngular', function (callback) {
    switch (config.watch) {
        case true:
        runSequence(
            'build-angular-watch',
            'mark-angular-complete',
        )
        break;
        case false:
        runSequence(
            'build-angular',
            'sassDevBuild',
            'mark-complete',
            callback);
        break;
    }

})

// With TypeScript Compiler.
gulp.task('buildDevTypeScript', function (callback) {
    switch (config.watch) {
        case true: 
        runSequence(
            'pre-clean',
            'ts-to-es6',
            'es6-to-es5',
            'es6-pre-to-es5',
            'es5-concat',
            'jquery-concat',
            'post-clean-dev',
            'browserify-es5',
            'mark-ts-complete',
            callback);
        break;
        case false:
        runSequence(
            'pre-clean',
            'ts-to-es6',
            'es6-to-es5',
            'es6-pre-to-es5',
            'es5-concat',
            'jquery-concat',
            'sassDevBuild',
            'post-clean-dev',
            'browserify-es5',
            'mark-complete',
            callback);
        break;                
    }
})



// ----------------------------------------------------------------------
// ∴ Build front-end for production.
// ----------------------------------------------------------------------

// With Angular Compiler.
gulp.task('buildProdAngular', function (callback) {
    runSequence(
        'pre-clean-prod-ng',
        'build-angular-prod',
        'concat-ng',
        'sassProdBuild',
        'mark-complete',
        callback);
})

// With TypeScript Compiler.
gulp.task('buildProdTypeScript', function (callback) {
    runSequence(
        'pre-clean-prod',
        'ts-to-es6-prod',
        'es6-to-es5',
        'es6-pre-to-es5',
        'es5-concat-prod',
        'jquery-concat-compress',
        'sassProdBuild',
        'browserify-es5-prod',
        'post-clean-prod',
        'mark-complete',
        callback);
})



// ----------------------------------------------------------------------
// ∴ Initialise either the Angular compiler, or the TypeScript compiler.
// ----------------------------------------------------------------------

gulp.task('build-angular', function(cb) {
    console.log(color(`
        ∴ Building Angular in DEVELOPMENT Mode.
    `, devColor))
    cmd('ng build', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
})

gulp.task('build-angular-watch', function(cb) {

    var internalConfig = config;

    console.log(color(`
        ∴ Building Angular in DEVELOPMENT Mode.
    `, devColor))
    console.log(color(`
        ∴ WARNING: Angular will recompile SILENTLY in this state.
        ∴ This is due to the nature of reporting in the NGBuild Pipeline.
        ∴ For ore verbose ngRebuild reporting, set 'useNgRecompiler' on line 42 of this file to 'false'
        ∴ And instead run 'ng build --watch' in a seperate terminal window alongside 'npm run build'
        ∴ useNgRecompiler is currently set to ${internalConfig.useNgRecompiler}
    `, 'YELLOW'))

    if(internalConfig.useNgRecompiler === true) {
        cmd('ng build --watch', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
})

gulp.task('build-angular-prod', function(cb) {
    console.log(color(`
        ∴ Building Angular in PRODUCTION Mode.
    `, prodColor)); 
    cmd('ng build --prod --aot --output-hashing none', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
})



// ----------------------------------------------------------------------
// ∴ Initialise Typscript compiler, concatinate jQuery.
// ----------------------------------------------------------------------

gulp.task('pre-clean', function() {
    console.log(color(`
        ∴ Cleaning up JS/TS folders
    `, devColor)); 
    gulp.src([staticLocals, tsCompilerOuts, jsCompilerOuts], {
        read: false
    })
    .pipe(plumber())
    .pipe(clean({force: true}));
})

gulp.task('ts-to-es6', function() {
    console.log(color(`
        ∴ Running TypeScript Transpiler
    `, devColor)); 
    return gulp.src([tsSource])
        .pipe(plumber())
        .pipe(tsc({
            typescript: require('typescript'),
            target: 'ES6',
        }))
        .pipe(gulp.dest(compilerEs6Out));
});





gulp.task('pre-clean-prod', function() {
    console.log(color(`
        ∴ Cleaning up JS/TS folders
    `, prodColor)); 
    gulp.src([staticLocals, tsCompilerOuts, jsCompilerOuts], {
        read: false
    })
    .pipe(plumber())
    .pipe(clean({force: true}));
})

gulp.task('pre-clean-prod-ng', function() {
    console.log(color(`
        ∴ Cleaning up Angular folders
    `, prodColor)); 
    gulp.src([webAppDistOut, staticLocals, tsCompilerOuts, jsCompilerOuts], {
        read: false
    })
    .pipe(plumber())
    .pipe(clean({force: true}));
})

gulp.task('ts-to-es6-prod', function() {
    console.log(color(`
        ∴ Running TypeScript Transpiler
    `, prodColor)); 
    return gulp.src([tsSource])
        .pipe(plumber())
        .pipe(tsc({
            typescript: require('typescript'),
            target: 'ES6',
        }))
        .pipe(gulp.dest(compilerEs6Out));
});

gulp.task('es6-to-es5', function() {
    return gulp.src(
            [
                es6TranspileCapture
            ])
        .pipe(plumber())
        .pipe(babel({
            presets: [
                ['@babel/env', {
                    modules: false
                }]
            ]
        }))
        .pipe(gulp.dest(compilerEs5Out));
});

gulp.task('es6-pre-to-es5', function() {
    return gulp.src(
            [
                jsSource
            ])
        .pipe(plumber())
        .pipe(babel({
            presets: [
                ['@babel/env', {
                    modules: false
                }]
            ]
        }))
        .pipe(gulp.dest('./webTS/_compiler/webJS'));
});

gulp.task('es5-concat', function() {
    return gulp.src([mainEs5Capture, mainEs5JSCapture])
        .pipe(plumber())
        .pipe(rollup({
            plugins: [ babel2() ]
        }, 
        {
            format: 'cjs',
        }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('es5-concat-prod', function() {
    return gulp.src([mainEs5Capture, mainEs5JSCapture])
        
        .pipe(plumber())
        .pipe(rollup({
            plugins: [ babel2() ]
        }, 
        {
            format: 'cjs',
        }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('browserify-es5', function() {
    browserify({
        entries: jsBundleLocal,
        debug: true
    })
    .bundle()
    .pipe(source(jsBundleLocal))
    .pipe(buffer())
    .pipe(gulp.dest('./'));
})

gulp.task('browserify-es5-prod', function() {
    browserify({
        entries: jsBundleLocal,
        debug: true
    })
    .bundle()
    .pipe(source(jsBundleLocal))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./'));
})

gulp.task('jquery-concat', function() {
    return gulp.src([preBundleJsAsset, preBundleVanillaJSAsset])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat(jsBundleName))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(jsDest));
})

gulp.task('jquery-concat-compress', function() {
    return gulp.src([preBundleJsAsset, preBundleVanillaJSAsset])
    .pipe(plumber())
    // .pipe(uglify())
    .pipe(concat(jsBundleName))
    .pipe(gulp.dest(jsDest));
})

//

gulp.task('dev-js-pipe', function() {
    return gulp.src(['./webTS/_compiler/es6_out/_source/*.js', './webJS/_source/*.js'])
    // .pipe()
    // .pipe(plumber())
    // .pipe(uglify())
    // .pipe(concat(jsBundleName))
    .pipe(gulp.dest(`${jsDest}/_source`));
})

gulp.task('dev-concat', function() {
    return gulp.src([jQSource, './webJS/main-js.js', './webTS/_compiler/es6_out/main-ts.js'])
    // .pipe(plumber())
    // .pipe(uglify())
    .pipe(concat(jsBundleName))
    .pipe(gulp.dest(jsDest));
})


//

gulp.task('post-clean-dev', function() {
    console.log(color(`
        ∴ Cleaning Development environment.
    `, devColor)); 
    gulp.src([preBundleJsAsset, preBundleVanillaJSAsset, jsFolderCapture, crossAppJsCapture], {
        read: false
    })
    .pipe(plumber())
    .pipe(clean({force: true}));
})

gulp.task('post-clean-prod', function() {
    console.log(color(`
        ∴ Cleaning Production environment.
    `, prodColor)); 
    gulp.src([preBundleJsAsset, preBundleVanillaJSAsset, jsFolderCapture, crossAppJsCapture, karma], {
        read: false
    })
    .pipe(plumber())
    .pipe(clean({force: true}));
})

gulp.task('concat-ng', function() {
    console.log(color(`
        ∴ Packaging Angular Production bundle.
    `, prodColor));
    return gulp.src([
    './webApp/dist/webApp/es2015-polyfills.js',
    './webApp/dist/webApp/polyfills.js',
    './webApp/dist/webApp/main.js',
    './webApp/dist/webApp/runtime.js'
])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat(jsBundleName))
    .pipe(gulp.dest(jsDest))
})



// ----------------------------------------------------------------------
// Initialise SCSS Transpilers, concatinate and distribute to Static.
// ----------------------------------------------------------------------

gulp.task('sassDevBuild', function () {
    console.log(color(`
        ∴ Running SCSS -> CSS Development Transpiler
        ∴ Source Mapping ENABLED
    `, devColor)); 
    gulp.src(sassBase)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(cssnano())
    .pipe(concat(cssBundleName))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssDest));
    if (config.watch === true) {
        gulp.start('mark-scss-complete');
    }
});

gulp.task('sassProdBuild', function () {
    console.log(color(`
        ∴ Cleaning CSS folder
    `, prodColor)); 
    gulp.src(cssBundleLocal, {
        read: false
    })
    .pipe(clean({force: true}));
    console.log(color(`
        ∴ Running SCSS -> CSS Production Transpiler
        ∴ Source Mapping DISABLED
    `, prodColor)); 
    gulp.src(sassBase)
    .pipe(plumber())
    .pipe(sass())
    .pipe(cssnano())
    .pipe(concat(cssBundleName))
    .pipe(gulp.dest(cssDest));
});



// ----------------------------------------------------------------------
// Mark Operation as Complete.
// ----------------------------------------------------------------------

gulp.task('mark-complete', function() {
    console.log(color(`
        ∴ Build Complete ✓
    `, 'BLUE'))
})

gulp.task('mark-ts-complete', function() {
    console.log(color(`
        ∴ TypeScript Re-Transpile Complete ✓
    `, 'YELLOW'))
})

gulp.task('mark-scss-complete', function() {
    console.log(color(`
        ∴ SCSS Re-Transpile Complete ✓
    `, 'YELLOW'))
})

gulp.task('mark-angular-complete', function() {
    console.log(color(`
        ∴ Angular Re-Transpile Complete ✓
    `, 'YELLOW'))
})