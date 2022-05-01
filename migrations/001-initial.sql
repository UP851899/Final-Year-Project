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

-- Insert Default filters --
INSERT INTO websiteFilters (filter_name)
VALUES
    ("Gambling"),
    ("Social Media"),
    ("Adult content"),
    ("News"),
    ("Drugs"),
    ("Shopping"),
    ("Entertainment"),
    ("Forum"),
    ("Games"),
    ("Virus & Malware");

-- Insert Default Blocking Sites/Keywords --
INSERT INTO blockedSites (site_address, filter_ID)
VALUES
    ("reddit", 2),
    ("omegle.com", 3),
    ("tinder", 3),
    ("paddypower.com", 1),
    ("chatroulette.com", 3),
    ("4chan", 3),
    ("ebay.com", 6),
    ("amazon.com", 6);


-- Login for dashboard --
CREATE TABLE admin (
    admin_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_username TEXT NOT NULL,
    admin_password TEXT NOT NULL
);

INSERT INTO admin (admin_ID, admin_username, admin_password)
VALUES
    (1, "admin", "admin"); -- Default account for testing