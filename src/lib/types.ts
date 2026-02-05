export interface Poem {
    id: string;
    title: string;
    lines: string[];
    pageNumber?: string;
}

export interface Chapter {
    id: string;
    title: string;
    poems: Poem[];
}

export interface Book {
    id: string;
    title: string;
    author: string;
    year?: string;
    intro?: string;
    chapters: Chapter[];
}
