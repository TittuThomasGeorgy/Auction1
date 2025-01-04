const classNames = ["KG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const categories = ['Nursery', 'Juniors', 'CAT I', 'CAT II', 'CAT III', 'CAT IV']

export const getCategory = (playerClass: number): number => {
    if (playerClass < 0) return -1;
    if (playerClass === 0) return 0;
    if (playerClass < 3) return 1;
    if (playerClass < 6) return 2;
    if (playerClass < 9) return 3;
    if (playerClass < 11) return 4;
    if (playerClass < 13) return 5;
    return -1;
};
export const getCategoryName = (playerClass: number): string | null => {
    const _cat = getCategory(playerClass)
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

