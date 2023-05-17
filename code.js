"use strict";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
try {
    figma.showUI(__html__, { width: 600, height: 600 });
}
catch (e) {
    console.log('error', e);
}
const mixingArr = [];
var scssArr = [];
figma.getLocalTextStyles().forEach((style) => {
    //console.log('style name',style.name);
    //console.warn('style',style);
    let mixinName = mixinNameGenerator(style.name);
    var fontWeight = fontWeightFinder(style.fontName.style);
    //console.log('lineHeight',style.lineHeight);
    var lineHeight = 'normal';
    var letterSpacing = 'normal';
    if (style.lineHeight === undefined || style.lineHeight === null) {
    }
    else {
        //console.log('before line height finder' ,style.lineHeight)
        // @ts-ignore
        lineHeight = unitFinder(style.lineHeight);
        if (style.lineHeight.unit === 'PIXELS') {
            lineHeight = calculatePercentage(style.fontSize, style.lineHeight.value);
        }
        //console.log('after line height finder' ,lineHeight)
    }
    if (style.letterSpacing === undefined || style.letterSpacing === null) {
    }
    else {
        //console.log('before letter spacing finder' ,style.letterSpacing)
        letterSpacing = unitFinder(style.letterSpacing);
        //console.log('after letter spacing finder' ,letterSpacing)
    }
    //switchcase for font weight
    const textStyle = {
        type: 'TEXT',
        styleName: style.name,
        fontSize: style.fontSize + 'px',
        textDecoration: style.textDecoration.toLowerCase(),
        fontFamily: style.fontName.family,
        fontWeight: fontWeight,
        letterSpacing: letterSpacing,
        lineHeight: lineHeight
    };
    //console.log('textStyle',textStyle);
    //create mixin for scss
    var recommendFontSize = "";
    if (style.fontSize > 50) {
        // make like that font-size:clamp(%20 percent down, 5vw, style.fontSize)))
        var mobileSize = style.fontSize - (style.fontSize * 0.2);
        if (mobileSize > 50) {
            mobileSize = 50;
        }
        //console.log('mobileSize',mobileSize);
        recommendFontSize = ` 
    /* Recommend for responsive css clamp(mobile, mid, desktop) - 
    you can change 5vw value
     font-size:clamp(${mobileSize}px, 5vw, ${style.fontSize}px); */`;
    }
    const mixin = ` 
@mixin ${mixinName} {
     // ${style.name} //
    font-family: '${textStyle.fontFamily}';
    font-weight: ${textStyle.fontWeight};
    font-size: ${style.fontSize + 'px'}; ${recommendFontSize}
    line-height: ${textStyle.lineHeight};
    text-decoration: ${textStyle.textDecoration};
    letter-spacing: ${textStyle.letterSpacing}; } `;
    scssArr.push(mixin);
    //console.warn('scssArr',scssArr);
});
figma.ui.postMessage(scssArr);
//create figma ui and paste scss codes to html textarea and also copy to clipboard
// @ts-ignore
function unitFinder(y) {
    var lineHeight = '';
    //console.log('first step finder',y);
    try {
        switch (y.unit) {
            case 'PIXELS':
                lineHeight = y.value.toFixed(1) + 'px';
                break;
            case 'PERCENT':
                lineHeight = y.value.toFixed(1) + '%';
                if (y.value === 0) {
                    lineHeight = 'normal';
                }
                break;
        }
    }
    catch (e) {
        //console.log('error',e);
    }
    return lineHeight;
}
// @ts-ignore
function fontWeightFinder(x) {
    var fontWeight = '';
    switch (x) {
        case 'Thin':
            fontWeight = '100';
            break;
        case 'ExtraLight':
            fontWeight = '200';
            break;
        case 'Light':
            fontWeight = '300';
            break;
        case 'Regular':
            fontWeight = 'normal';
            break;
        case 'Medium':
            fontWeight = '500';
            break;
        case 'SemiBold':
            fontWeight = '600';
            break;
        case 'Bold':
            fontWeight = 'bold';
            break;
        case 'ExtraBold':
            fontWeight = '800';
            break;
        case 'Black':
            fontWeight = '900';
            break;
        default:
            fontWeight = 'normal';
    }
    return fontWeight;
}
// @ts-ignore
function mixinNameGenerator(mixinName) {
    //remove all specials characters and spaces and replace with - replace also '/' char with -
    mixinName = 'font-' + mixinName.replace(/[/\s]/g, '-').toLowerCase();
    return mixinName;
}
// @ts-ignore
function calculatePercentage(fontsize, lineheight) {
    let percentage = (lineheight / fontsize) * 100;
    percentage = Number(percentage.toFixed(2));
    return `${percentage}%`;
}
