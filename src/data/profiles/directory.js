/**
 * Staff Directory Data
 * 
 * @description Employee entries for the Staff Directory view.
 * Separate from profiles - this is public-facing directory data.
 */

export const DIRECTORY_EMPLOYEES = [
    { name: "Sarah Kone", title: "Chief Auditor", dept: "HQ - FINANCE", id: "7700", status: "ACTIVE", level: 3, isHead: true },
    { name: "Patricia Vance", title: "HR Director", dept: "HQ - HR", id: "4492", status: "ACTIVE", level: 3, isHead: true },
    { name: "David Bowman", title: "SysAdmin", dept: "HQ - IT", id: "9000", status: "ACTIVE", level: 2, isHead: true },
    { name: "Gordon Freeman", title: "Researcher", dept: "SECTOR 7", id: "1998", status: "ACTIVE", level: 2, isHead: false },
    { name: "Isaac Clarke", title: "Engineer", dept: "SECTOR 7", id: "1001", status: "ACTIVE", level: 1, isHead: false },
    { name: "Ellen Ripley", title: "Chief Scientist", dept: "SECTOR 7", id: "1979", status: "MIA", level: 2, isHead: true },
    { name: "Jim Halpert", title: "Sales Lead", dept: "SALES", id: "7331", status: "ACTIVE", level: 2, isHead: true },
    { name: "Bill Lumbergh", title: "Manager", dept: "SALES", id: "0451", status: "ACTIVE", level: 2, isHead: true },
    { name: "Intern #442", title: "Intern", dept: "HQ - GENERAL", id: "0000", status: "ACTIVE", level: 1, isHead: false },
];

/**
 * Directory filter options
 */
export const DIRECTORY_FILTERS = ['ALL', 'HQ', 'SECTOR 7', 'SALES'];

/**
 * Filter employees by department
 */
export const filterEmployees = (filter) => {
    if (filter === 'ALL') return DIRECTORY_EMPLOYEES;
    return DIRECTORY_EMPLOYEES.filter(e => e.dept.includes(filter));
};
