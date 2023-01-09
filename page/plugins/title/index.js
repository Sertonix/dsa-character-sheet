const TITLE_DATA_NAME = "title.title";

const defaultTitle = document.title;
dsa.data.addObserver(TITLE_DATA_NAME, title => document.title = title ?? defaultTitle );
