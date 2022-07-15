import { ServerAPI } from 'decky-frontend-lib';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import { AppContext, AppContextProvider } from '../../context/AppContext';
import { FullScreenGuide } from '../FullScreenGuide/FullScreenGuide';
import parse, {
    HTMLReactParserOptions,
    Element,
    domToReact,
} from 'html-react-parser';
import { headers } from '../../constants';
import DOMPurify from 'dompurify';

type GuideProps = {
    serverApi: ServerAPI;
    fullscreen?: boolean;
};

export const guideStyle = {
    border: 'none',
    overflow: 'hidden',
    height: '100%',
};

export const Guide = ({ serverApi, fullscreen }: GuideProps) => {
    const { state } = useContext(AppContext);
    const { currentGuide } = state;
    const guideDiv = useRef<HTMLDivElement>(null);
    //@ts-ignore
    //const quickAccessTab = FocusNavController.GetGamepadNavTreeByID("QuickAccess-NA").Root.Element;
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (
                domNode instanceof Element &&
                domNode.name === 'a' &&
                domNode.attribs &&
                domNode.attribs.href
            ) {
                const children = domNode.children;
                let anchor = '';
                if (domNode.attribs.href.startsWith('#')) {
                    anchor = domNode.attribs.href.substring(1);
                    return (
                        <a
                            {...domNode.attribs}
                            onClick={(e) => {
                                e.preventDefault();
                                setAnchor(anchor);
                            }}
                        >
                            {domToReact(children)}
                        </a>
                    );
                } else {
                    anchor = domNode.attribs.href;
                    return (
                        <a
                            {...domNode.attribs}
                            onClick={async (e) => {
                                e.preventDefault();
                                const baseUrl = currentGuide?.guideUrl ?? '';

                                const response = await serverApi.fetchNoCors<{
                                    body: string;
                                }>(`${baseUrl}/${anchor}`, { headers });
                                if (response.success) {
                                    const htmlBody = response.result.body;

                                    const parser = new DOMParser();
                                    const faq = parser.parseFromString(
                                        htmlBody,
                                        'text/html'
                                    );
                                    const faqBody =
                                        faq.getElementById('faqwrap');
                                    const guide = DOMPurify.sanitize(
                                        faqBody?.outerHTML ?? ''
                                    );
                                    setElements(parse(guide ?? '', options));
                                    if (anchor.indexOf('#') > 0) {
                                        anchor = anchor.substring(
                                            anchor.indexOf('#') + 1
                                        );
                                        setAnchor(anchor);
                                    }
                                }
                            }}
                        >
                            {domToReact(children)}
                        </a>
                    );
                }
            }
            return domNode;
        },
    };

    const guideText = currentGuide?.guideText;
    const guide = parse(guideText ?? '', options);

    const [elements, setElements] = useState(guide);
    const [anchor, setAnchor] = useState('');
    let cssId: any = '';

    useEffect(() => {
        if (anchor) {
            const elementToScrollTo =
                guideDiv.current?.querySelector(`[name="${anchor}"]`) ??
                guideDiv.current?.querySelector(`#${anchor}`);
            elementToScrollTo && elementToScrollTo.scrollIntoView();
        }
    }, [elements, anchor]);
    useEffect(() => {
        if (!fullscreen) {
            serverApi.routerHook.addRoute('/deckfaqs-fullscreen', () => {
                return (
                    <AppContextProvider initState={state}>
                        <FullScreenGuide serverApi={serverApi} />
                    </AppContextProvider>
                );
            });
        }
        serverApi
            .injectCssIntoTab(
                !fullscreen ? 'QuickAccess' : 'SP',
                `body {
                    color: #0d0d0d;
                  }
                  html {
                    font-size: 14px;
                    line-height: 18px;
                  }
                  @media (max-width: 767px) {
                    html {
                      font-size: 13px;
                    }
                  }
                  a {
                    text-decoration: none;
                    color: #3449b2;
                  }
                  a:hover {
                    color: #516dfb;
                    cursor: pointer;
                    text-decoration: underline;
                  }
                  a:hover p {
                    text-decoration: none !important;
                  }
                  a:hover s {
                    text-decoration: underline;
                  }
                  p {
                    margin: 0 0 18px;
                  }
                  ul {
                    list-style: disc;
                  }
                  ol {
                    list-style: decimal;
                  }
                  ul,
                  ol,
                  dl {
                    padding-left: 18px;
                    margin: 0 0 9px 0;
                  }
                  ul li,
                  ol li,
                  dl li {
                    margin-bottom: 9px;
                  }
                  ul li ul,
                  ul li ol,
                  ol li ul,
                  ol li ol,
                  dl li ul,
                  dl li ol {
                    margin-top: 9px;
                  }
                  ul li ul li,
                  ol li ul li,
                  dl li ul li {
                    list-style: circle;
                  }
                  ul dd,
                  ol dd,
                  dl dd {
                    margin: 0 0 9px 0;
                  }
                  img,
                  video {
                    max-width: 100%;
                  }
                  h1,
                  h2,
                  h3,
                  h4,
                  h5,
                  h6 {
                    margin: 0 0 4.5px;
                    -webkit-font-smoothing: antialiased;
                    font-weight: normal;
                    visibility: visible;
                  }
                  h1 a,
                  h2 a,
                  h3 a,
                  h4 a,
                  h5 a,
                  h6 a {
                    color: #0d0d0d;
                  }
                  h1 a:hover,
                  h2 a:hover,
                  h3 a:hover,
                  h4 a:hover,
                  h5 a:hover,
                  h6 a:hover {
                    color: #516dfb;
                  }
                  h1,
                  .page-title {
                    font-size: 30px;
                    line-height: 36px;
                  }
                  @media (max-width: 767px) {
                    h1,
                    .page-title {
                      font-size: 22px;
                      line-height: 27px;
                    }
                  }
                  h2,
                  .section-title {
                    font-size: 21px;
                    line-height: 27px;
                  }
                  @media (max-width: 767px) {
                    h2,
                    .section-title {
                      font-size: 18px;
                      line-height: 18px;
                    }
                  }
                  h3,
                  .subsection-title {
                    color: #333;
                    font-size: 19px;
                    line-height: 27px;
                  }
                  @media (max-width: 767px) {
                    h3,
                    .subsection-title {
                      font-size: 16px;
                      line-height: 18px;
                    }
                  }
                  h4,
                  h5,
                  h6,
                  .minor-title {
                    color: #333;
                    font-size: 17px;
                    line-height: 18px;
                  }
                  @media (max-width: 767px) {
                    h4,
                    h5,
                    h6,
                    .minor-title {
                      font-size: 13px;
                      line-height: 18px;
                    }
                  }
                  .h1_name {
                    font-size: 21px;
                    line-height: 21px;
                    display: block !important;
                    margin-top: 8px;
                  }
                  @media (max-width: 767px) {
                    .h1_name {
                      font-size: 18px;
                      line-height: 18px;
                    }
                  }
                  #faq_header_wrap {
                    background: #fff;
                    color: #000;
                    border-bottom: 1px solid #999;
                    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
                    display: none;
                    height: 118px;
                    width: 100%;
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap {
                      height: 92px;
                    }
                  }
                  #faq_header_wrap #faq_header {
                    margin: 0 auto;
                    height: 64px;
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header {
                      height: 50px;
                    }
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header {
                      width: 95%;
                    }
                  }
                  @media (min-width: 768px) {
                    #faq_header_wrap #faq_header {
                      width: 768px;
                    }
                  }
                  @media (min-width: 980px) {
                    #faq_header_wrap #faq_header {
                      width: 980px;
                    }
                  }
                  @media (min-width: 1210px) {
                    #faq_header_wrap #faq_header {
                      width: 1160px;
                    }
                  }
                  #faq_header_wrap #faq_header #home_links {
                    display: inline-block;
                    position: relative;
                    width: 65px;
                  }
                  @media (max-width: 1209px) {
                    #faq_header_wrap #faq_header #home_links {
                      top: 16px;
                    }
                  }
                  @media (min-width: 1210px) {
                    #faq_header_wrap #faq_header #home_links {
                      top: 11px;
                    }
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header #home_links {
                      top: 11px;
                    }
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header #home_links {
                      width: 90px;
                    }
                  }
                  #faq_header_wrap #faq_header #home_links .gfaqs_icon {
                    position: relative;
                  }
                  #faq_header_wrap #faq_header #home_links .gfaqs_icon img {
                    height: 32px;
                    width: 40px;
                  }
                  @media (min-width: 768px) {
                    #faq_header_wrap #faq_header #home_links .fa-search,
                    #faq_header_wrap #faq_header #home_links .search_mobile {
                      display: none;
                    }
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header #home_links .fa-search {
                      bottom: 7px;
                      display: inline-block;
                      font-size: 18px;
                      position: relative;
                    }
                    #faq_header_wrap #faq_header #home_links .search_mobile {
                      display: inline-block;
                      left: 26px;
                      position: relative;
                      top: -3px;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_search_module {
                    display: inline-table;
                    position: relative;
                    width: 460px;
                  }
                  @media (max-width: 979px) {
                    #faq_header_wrap #faq_header #faq_search_module {
                      width: 280px;
                    }
                  }
                  @media (max-width: 1209px) {
                    #faq_header_wrap #faq_header #faq_search_module {
                      top: 7px;
                    }
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header #faq_search_module {
                      display: none;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_bookmark {
                    color: #999;
                    cursor: pointer;
                    display: inline-table;
                    font-size: 10px;
                    position: relative;
                    text-align: center;
                    width: 60px;
                  }
                  #faq_header_wrap #faq_header #faq_bookmark.active {
                    color: #3449b2;
                  }
                  @media (min-width: 768px) {
                    #faq_header_wrap #faq_header #faq_bookmark {
                      left: 28px;
                    }
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header #faq_bookmark {
                      float: right;
                      right: 15px;
                      top: 14px;
                    }
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header #faq_bookmark {
                      right: 0;
                      top: 12px;
                    }
                  }
                  @media (min-width: 1210px) {
                    #faq_header_wrap #faq_header #faq_bookmark {
                      top: -8px;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_bookmark:hover {
                    text-decoration: underline;
                  }
                  #faq_header_wrap #faq_header #faq_bookmark .fa-bookmark {
                    font-size: 20px;
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header #faq_bookmark .fa-bookmark {
                      font-size: 28px;
                    }
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header #faq_bookmark .bm_inner {
                      display: none;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_toc {
                    display: inline-table;
                    float: right;
                    position: relative;
                    top: 18px;
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap #faq_header #faq_toc {
                      top: 12px;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"] {
                    background: #fff;
                    border: 1px solid #999;
                    border-radius: 2px;
                    box-shadow: 0 1px 1px 0 rgba(214, 214, 214, 0.5);
                    color: #3449b2;
                    display: inline;
                    font-size: 13px;
                    height: 100%;
                    padding: 9px 15px;
                    width: 100%;
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap #faq_header #faq_toc a[class^="toc_"] span.toc_text {
                      display: none;
                    }
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"]:hover {
                    background-color: #eee;
                    text-decoration: none;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_toggle {
                    margin: 0;
                    padding-left: 8px;
                    padding-right: 8px;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_toggle span {
                    position: relative;
                    top: 3px;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_toggle i {
                    font-size: 21px;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_toggle.active {
                    background-color: #3449b2;
                    color: #fff;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_prev {
                    margin-right: 10px;
                  }
                  #faq_header_wrap #faq_header #faq_toc a[class^="toc_"].toc_next {
                    margin-left: 10px;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header {
                    background: #fff;
                    color: #000;
                    border-top: 3px solid #3449b2;
                    box-shadow: 0 5px 5px 0 rgba(214, 214, 214, 0.8);
                    display: none;
                    float: right;
                    font-size: 13px;
                    max-height: 435px;
                    overflow-y: scroll;
                    position: absolute;
                    right: 0;
                    top: 40px;
                    width: 288px;
                    z-index: 99999;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_header_top {
                    border-bottom: 1px solid #eee;
                    font-weight: bold;
                    padding: 15px 20px 9px 22px;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_header_info {
                    display: inline-block;
                    line-height: 15px;
                    width: 175px;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_header_info,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_header_info a {
                    color: #999;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_header_head {
                    font-size: 14px;
                    font-weight: bold;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_close {
                    float: right;
                    font-weight: bold;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu {
                    font-weight: bold;
                    padding-left: 0;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol {
                    list-style: none;
                    margin-bottom: 0;
                    padding-left: 0;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu li,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li {
                    border-bottom: 1px solid #f3f3f3;
                    margin-bottom: 0;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu li a,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu li b,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li a,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li b {
                    display: block;
                    height: 100%;
                    padding: 9px 22px;
                    width: 100%;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li {
                    font-weight: normal;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li a {
                    color: #28398a;
                  }
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li a,
                  #faq_header_wrap #faq_header #faq_toc #faq_toc_header .toc_menu ol li b {
                    padding-bottom: 7px;
                    padding-left: 37px;
                    padding-top: 7px;
                  }
                  #faq_header_wrap.fixed {
                    display: block;
                    left: 0;
                    position: fixed;
                    right: 0;
                    top: 0;
                    z-index: 99999;
                  }
                  @media (max-width: 767px) {
                    #faq_header_wrap.fixed.search {
                      top: -118px;
                    }
                  }
                  #faq_header_wrap.rec_closed {
                    height: 64px;
                  }
                  @media (max-width: 480px) {
                    #faq_header_wrap.rec_closed {
                      height: 52px;
                    }
                  }
                  
                  .ffaq_page {
                    background: #ededed;
                    text-align: center;
                    display: block;
                    clear: both;
                  }
                  .ffaq {
                    font-size: 14px;
                    word-wrap: break-word;
                  }
                  .ffaq a {
                    color: #3449b2;
                    font-weight: bold;
                    text-decoration: none;
                  }
                  .ffaq a:hover {
                    text-decoration: underline;
                    color: #7585d7 !important;
                  }
                  .ffaq a[name] {
                    color: #0d0d0d;
                    font-weight: normal;
                    text-decoration: none;
                  }
                  .ffaq a[name]:hover {
                    color: #0d0d0d !important;
                    cursor: text;
                  }
                  .ffaq p {
                    line-height: 20px;
                  }
                  .ffaq div.ftoc {
                    background-color: #fff;
                    border: 1px solid #999;
                    clear: right;
                    float: right;
                    font-size: 13px;
                    line-height: 140%;
                    margin: 0 0 10px 10px;
                    padding: 15px 20px;
                    width: 25%;
                  }
                  @media (max-width: 979px) {
                    .ffaq div.ftoc {
                      clear: none;
                      display: inline-block;
                      float: none;
                      margin: 0 auto;
                      width: auto;
                    }
                  }
                  .ffaq div.ftoc h3 {
                    border: none !important;
                    font-size: 14px;
                    padding-top: 0;
                  }
                  .ffaq div.ftoc ol,
                  .ffaq div.ftoc ol li {
                    margin: 0;
                  }
                  .ffaq div.ftoc ol {
                    padding: 0;
                  }
                  .ffaq div.ftoc ol li {
                    list-style-type: none;
                  }
                  .ffaq div.ftoc ol ol {
                    padding-left: 25px;
                  }
                  .ffaq div.ftoc ol ol li {
                    list-style-type: circle !important;
                  }
                  .ffaq div.ftoc li {
                    padding: 2px;
                  }
                  .ffaq div.section_box,
                  .ffaq div.spoiler_box,
                  .ffaq blockquote {
                    background-color: #c4cbee;
                    border-style: solid;
                    border-width: 1px;
                    clear: left;
                    color: #0d0d0d;
                    display: table;
                    margin: 15px 15px 18px 0;
                    overflow: hidden;
                    padding: 5px;
                    width: 66%;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.section_box,
                    .ffaq div.spoiler_box,
                    .ffaq blockquote {
                      overflow: auto;
                    }
                  }
                  @media (max-width: 767px) {
                    .ffaq div.section_box,
                    .ffaq div.spoiler_box,
                    .ffaq blockquote {
                      display: block;
                      overflow-x: scroll;
                      width: auto;
                    }
                  }
                  .ffaq div.section_box p:last-child,
                  .ffaq div.section_box ul:last-child,
                  .ffaq div.section_box ol:last-child,
                  .ffaq div.section_box dl:last-child,
                  .ffaq div.spoiler_box p:last-child,
                  .ffaq div.spoiler_box ul:last-child,
                  .ffaq div.spoiler_box ol:last-child,
                  .ffaq div.spoiler_box dl:last-child,
                  .ffaq blockquote p:last-child,
                  .ffaq blockquote ul:last-child,
                  .ffaq blockquote ol:last-child,
                  .ffaq blockquote dl:last-child {
                    margin-bottom: 0;
                  }
                  .ffaq div.section_box a,
                  .ffaq div.spoiler_box a,
                  .ffaq blockquote a {
                    color: #3449b2;
                  }
                  .ffaq div.section_box h6 {
                    color: #0d0d0d;
                  }
                  .ffaq div.spoiler_box,
                  .ffaq i[data-spoiler="inline"],
                  .ffaq .fspoiler,
                  .ffaq .fspoiler a {
                    background-color: #bbb;
                    border-color: #d9d9d9;
                    color: #bbb;
                  }
                  .ffaq i[data-spoiler="inline"] {
                    font-style: normal;
                  }
                  .ffaq i[data-spoiler="inline"] h6 {
                    color: #b31a1a;
                  }
                  .ffaq i[data-underline="inline"] {
                    font-style: normal;
                    text-decoration: underline;
                  }
                  .ffaq strong strong,
                  .ffaq strong strong a {
                    font-weight: bolder;
                  }
                  @media (max-width: 979px) {
                    .ffaq h2,
                    .ffaq h3,
                    .ffaq h4,
                    .ffaq h5,
                    .ffaq h6 {
                      clear: both;
                      display: block;
                    }
                  }
                  .ffaq h2,
                  .ffaq h3 {
                    overflow: hidden;
                    padding-top: 10px;
                  }
                  .ffaq h2 a,
                  .ffaq h3 a {
                    color: #0d0d0d;
                    font-weight: normal;
                  }
                  .ffaq h2 {
                    border-color: #d9d9d9;
                    border-style: solid;
                    border-width: 0px 0px 2px 0px;
                    font-size: 20px;
                    line-height: 24px;
                  }
                  .ffaq h3 {
                    border-color: #555;
                    border-style: dashed;
                    border-width: 0px 0px 1px 0px;
                    font-size: 17px;
                    line-height: 20px;
                    margin-bottom: 10px;
                  }
                  .ffaq h4 .spoiler,
                  .ffaq h5 .spoiler,
                  .ffaq h6 .spoiler {
                    color: #f2f2f2 !important;
                  }
                  .ffaq h4 {
                    font-size: 15px;
                    padding-top: 10px;
                  }
                  .ffaq h5,
                  .ffaq h6 {
                    font-size: 13px;
                    font-weight: normal;
                  }
                  .ffaq h5 a,
                  .ffaq h6 a {
                    color: #0d0d0d;
                  }
                  .ffaq h4 a {
                    color: #3449b2;
                    font-weight: normal;
                  }
                  .ffaq h2 a:hover,
                  .ffaq h4 a:hover,
                  .ffaq h6 a:hover {
                    text-decoration: none;
                    color: #3449b2 !important;
                  }
                  .ffaq h3 a:hover,
                  .ffaq h5 a:hover {
                    text-decoration: none;
                    color: #0d0d0d !important;
                  }
                  .ffaq hr,
                  .ffaq pre {
                    margin-bottom: 18px;
                  }
                  @media (max-width: 767px) {
                    .ffaq hr,
                    .ffaq pre {
                      font-size: 10px;
                    }
                  }
                  .ffaq table {
                    border: 1px solid #000;
                    margin-bottom: 18px;
                    margin-right: 5px;
                    table-layout: fixed;
                    width: auto;
                  }
                  @media (max-width: 979px) {
                    .ffaq table {
                      clear: both;
                    }
                  }
                  @media (max-width: 767px) {
                    .ffaq table {
                      width: 100% !important;
                    }
                  }
                  @media (max-width: 767px) {
                    .ffaq table {
                      display: inline-table;
                      overflow-x: scroll;
                    }
                  }
                  .ffaq table tr:nth-child(2n + 1),
                  .ffaq table tr:nth-child(2n + 1) td {
                    background-color: #d7dcf4;
                  }
                  .ffaq table td,
                  .ffaq table th {
                    background-color: #d7dcf4;
                    border: 1px solid #000;
                    color: #0d0d0d;
                    box-shadow: none;
                    font: inherit;
                    padding: 3px 5px;
                    text-shadow: none;
                    vertical-align: middle;
                  }
                  @media (max-width: 767px) {
                    .ffaq table td,
                    .ffaq table th {
                      font-size: 10px;
                      padding: 1px;
                    }
                  }
                  .ffaq table td.l,
                  .ffaq table th.l {
                    text-align: left;
                  }
                  .ffaq table td.c,
                  .ffaq table th.c {
                    text-align: center;
                  }
                  .ffaq table td.r,
                  .ffaq table th.r {
                    text-align: right;
                  }
                  .ffaq table td img,
                  .ffaq table th img {
                    max-width: none !important;
                  }
                  .ffaq table td p:last-child,
                  .ffaq table th p:last-child {
                    margin-bottom: 0;
                  }
                  .ffaq table tr {
                    border: 1px solid #000;
                  }
                  .ffaq table th,
                  .ffaq table thead td {
                    background-color: #b0b9e8 !important;
                    font-weight: bold;
                    text-align: center;
                  }
                  .ffaq table.unmargin {
                    display: inline-table;
                  }
                  .ffaq div.fimg_small,
                  .ffaq div.fimg_smallleft,
                  .ffaq div.fimg_smallright,
                  .ffaq div.fimg_large,
                  .ffaq div.fimg_largeleft,
                  .ffaq div.cimg_s,
                  .ffaq div.cimg_l {
                    font-size: 10px;
                    border-style: solid;
                    border-width: 1px;
                    padding: 2px;
                  }
                  .ffaq div.fimg_small,
                  .ffaq div.cimg_s {
                    clear: right;
                    float: right;
                    margin: 10px 10px 18px;
                    max-width: 300px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.fimg_small,
                    .ffaq div.cimg_s {
                      clear: both;
                      display: inline-block;
                      float: none;
                      margin: 0 0 10px;
                    }
                  }
                  .ffaq div.fimg_smallleft,
                  .ffaq div.cimg_sleft {
                    clear: left;
                    float: left;
                    margin: 10px 20px 10px 10px;
                    max-width: 300px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.fimg_smallleft,
                    .ffaq div.cimg_sleft {
                      clear: both;
                      display: inline-block;
                      float: none;
                      margin: 0 0 10px;
                    }
                  }
                  .ffaq div.fimg_smallright,
                  .ffaq div.cimg_sright {
                    clear: right;
                    float: right;
                    margin: 10px 10px 10px 20px;
                    max-width: 300px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.fimg_smallright,
                    .ffaq div.cimg_sright {
                      clear: both;
                      display: inline-block;
                      float: none;
                      margin: 0 0 10px;
                    }
                  }
                  .ffaq div.fimg_largeleft {
                    clear: left;
                    float: left;
                    margin: 10px 10px 18px;
                    max-width: 750px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.fimg_largeleft {
                      margin: 0;
                      max-width: 100%;
                    }
                  }
                  .ffaq div.fimg_large,
                  .ffaq div.cimg_l {
                    clear: both;
                    float: left;
                    margin: 10px 10px 18px;
                    max-width: 750px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.fimg_large,
                    .ffaq div.cimg_l {
                      margin: 0;
                    }
                  }
                  .ffaq div.clear {
                    clear: left;
                  }
                  .ffaq img.fimg_small,
                  .ffaq img.fimg_large,
                  .ffaq img.cimg_s,
                  .ffaq img.cimg_l {
                    height: auto;
                    max-width: 100% !important;
                    width: auto;
                  }
                  .ffaq img.imgleft {
                    float: left;
                    margin-right: 10px;
                  }
                  .ffaq img.imgright {
                    float: right;
                    margin-left: 10px;
                  }
                  .ffaq img.imgnofloat {
                    float: none;
                    margin-right: 2px;
                    vertical-align: middle;
                  }
                  @media (max-width: 767px) {
                    .ffaq img.bigresize {
                      height: 100% !important;
                      width: 100% !important;
                    }
                    .ffaq table img.bigresize {
                      height: auto !important;
                      width: auto !important;
                      max-height: 100% !important;
                      max-width: 100% !important;
                    }
                  }
                  .ffaq iframe.fvid_left,
                  .ffaq iframe.cvid_left,
                  .ffaq div.fvid_left,
                  .ffaq div.cvid_left {
                    clear: left;
                    float: left;
                    margin: 5px 20px 5px 5px;
                  }
                  @media (max-width: 767px) {
                    .ffaq iframe.fvid_left,
                    .ffaq iframe.cvid_left,
                    .ffaq div.fvid_left,
                    .ffaq div.cvid_left {
                      margin: 5px;
                    }
                  }
                  .ffaq iframe.fvid_right,
                  .ffaq iframe.cvid_right,
                  .ffaq div.fvid_right,
                  .ffaq div.cvid_right {
                    clear: right;
                    float: right;
                    margin: 5px 5px 5px 20px;
                  }
                  @media (max-width: 767px) {
                    .ffaq iframe.fvid_right,
                    .ffaq iframe.cvid_right,
                    .ffaq div.fvid_right,
                    .ffaq div.cvid_right {
                      margin: 5px;
                    }
                  }
                  @media (max-width: 480px) {
                    .ffaq iframe,
                    .ffaq div {
                      height: 100%;
                      width: 100%;
                    }
                  }
                  .ffaq div.vid_container.large {
                    height: 270px;
                    width: 480px;
                  }
                  .ffaq div.vid_container.small {
                    height: 190px;
                    width: 320px;
                  }
                  @media (max-width: 767px) {
                    .ffaq div.vid_container {
                      height: 100% !important;
                      width: 100% !important;
                    }
                  }
                  .ffaq img.yt_thumb {
                    cursor: pointer;
                    object-fit: cover;
                  }
                  .ffaq img.yt_thumb.large {
                    height: 270px;
                    width: 480px;
                  }
                  @media (max-width: 480px) {
                    .ffaq img.yt_thumb.large {
                      object-fit: scale-down;
                      width: 100%;
                    }
                  }
                  .ffaq img.yt_thumb.small {
                    height: 190px;
                    width: 320px;
                  }
                  .ffaq div.play_btn {
                    background: url(https://gamefaqs.gamespot.com/a/images/site/av-splash-65x130.png)
                      top no-repeat;
                    cursor: pointer;
                    height: 65px;
                    margin: 0 auto;
                    position: relative;
                    width: 65px;
                  }
                  .ffaq div.play_btn:hover {
                    background-position: 0 -65px;
                  }
                  .ffaq div.play_btn.large {
                    top: -170px;
                  }
                  @media (max-width: 480px) {
                    .ffaq div.play_btn.large {
                      top: -50%;
                    }
                  }
                  .ffaq div.play_btn.small {
                    top: -130px;
                  }
                  .ffaq ol,
                  .ffaq ul {
                    margin-bottom: 18px;
                    padding-left: 40px;
                  }
                  .ffaq ol li,
                  .ffaq ul li {
                    line-height: 18px;
                    margin-bottom: 0;
                    padding: 3px 0;
                  }
                  .ffaq ol li ol,
                  .ffaq ol li ul,
                  .ffaq ul li ol,
                  .ffaq ul li ul {
                    margin-bottom: 0;
                  }
                  .ffaq:not(.faq_menu_wrap) ul + li,
                  .ffaq:not(.faq_menu_wrap) ol + li {
                    margin-top: -20px;
                  }
                  .ffaq dl dl {
                    text-indent: 15px;
                  }
                  .ffaq dl dl dl {
                    text-indent: 40px;
                  }
                  .ffaq dl dl dl dl {
                    text-indent: 65px;
                  }
                  .ffaq .faqtext {
                    display: table;
                    margin: 0 auto !important;
                    background: #fff;
                  }
                  @media (max-width: 767px) {
                    .ffaq .faqtext {
                      overflow-x: auto;
                    }
                  }
                  @media (min-width: 768px) {
                    .ffaq .faqtext {
                      padding: 25px 100px;
                    }
                  }
                  @media (max-width: 767px) {
                    .ffaq .faqtext {
                      background: none !important;
                    }
                  }
                  .ffaq .faqtext pre {
                    margin: 0px !important;
                    font: 14px "Courier New", "Courier", monospace !important;
                  }
                  @media (max-width: 767px) {
                    .ffaq .faqtext pre {
                      font: 11px "Roboto Mono", "Courier New", "Courier", monospace !important;
                    }
                  }
                  @media (max-width: 480px) {
                    .ffaq .faqtext pre {
                      font: 7.5px "Roboto Mono", "Courier New", "Courier", monospace !important;
                    }
                  }
                  .ffaq.imgmain {
                    display: table;
                    margin: 0 auto;
                  }
                  .ffaq.imgmain p {
                    font-size: 12px;
                    margin-bottom: 0;
                  }
                  .ffaq.imgmain img.imgresize {
                    max-width: 100%;
                    width: 100%;
                  }
                  `
            )
            .then((response) => {
                if (response.success) cssId = response.result;
                console.log(cssId.result);
            });
        return function cleanup() {
            if (!fullscreen)
                serverApi.routerHook.removeRoute('/deckfaqs-fullscreen');
            serverApi.removeCssFromTab(
                !fullscreen ? 'QuickAccess' : 'SP',
                cssId.result
            );
        };
    }, []);

    // const guide = guideText ? (
    //     <div style={{ height: '100%', overflowY: 'scroll' }}>
    //         <pre style={{ whiteSpace: 'pre-wrap' }}>{guideText}</pre>
    //     </div>
    // ) : (
    //     <div style={{ height: '400px' }}>
    //         <iframe src={guideUrl} style={guideStyle} sandbox="" />
    //     </div>
    // );
    return useMemo(
        () => (
            <div style={{ background: '#fff' }} ref={guideDiv}>
                {elements}
            </div>
        ),
        [elements]
    );
};
