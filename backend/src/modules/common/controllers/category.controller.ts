const classNames = ["KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const categories = ['Nursery', 'Juniors', 'CAT I', 'CAT II', 'CAT III', 'CAT IV']

export const getCategory = (studentClass: number): number => {
    if (studentClass < 0) return -1;
    if (studentClass === 0) return 0;
    if (studentClass < 3) return 1;
    if (studentClass < 6) return 2;
    if (studentClass < 9) return 3;
    if (studentClass < 11) return 4;
    if (studentClass < 13) return 5;
    return -1;
};
export const getCategoryName = (studentClass: number): string | null => {
    const _cat = getCategory(studentClass)
    if (_cat === -1) return null
    else return categories[_cat];
};

export const getClass = (category: number): number[] | -1 => {
    const classMap: { [key: number]: number[] } = {
        0: [0],
        1: [1, 2],
        2: [3, 4, 5],
        3: [6, 7, 8],
        4: [9, 10],
        5: [11, 12]
    };
    return classMap[category] ?? -1;
};

