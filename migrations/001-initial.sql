DROP TABLE IF EXISTS blockedSites;
DROP TABLE IF EXISTS websiteFilters;

CREATE TABLE websiteFilters (
    filter_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    filter_name TEXT NOT NULL
);

CREATE TABLE blockedSites (
    site_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    site_address TEXT NOT NULL,
    filter_ID INTEGER NOT NULL,
    FOREIGN KEY (filter_ID)
        REFERENCES websiteFilters (filter_ID)
);
