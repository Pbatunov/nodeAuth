import {useState} from 'react';
import './styles.scss';

// Цвета с достаточным контрастом для белых букв.
const PALETTE = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#00897B', '#C2185B', '#3949AB'];

// Одинаковый ключ всегда даёт один и тот же цвет.
const pickColor = (key) => {
    let hash = 0;

    for (const char of String(key)) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    return PALETTE[hash % PALETTE.length];
};

// Первые буквы первых двух слов имени: «Иван Петров» → «ИП».
const getInitials = (name) => {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => [...word][0])
        .join('')
        .toUpperCase();

    return initials || '?';
};

export const Avatar = ({name = '', userId, src, size = 50}) => {
    // Запоминаем адрес, который не загрузился, чтобы при смене src снова попробовать картинку.
    const [failedSrc, setFailedSrc] = useState(null);
    const sizeStyle = {width: size, height: size};

    if (src && src !== failedSrc) {
        return (
            <img
                className='avatar'
                src={src}
                alt=''
                style={sizeStyle}
                onError={() => setFailedSrc(src)}
            />
        );
    }

    return (
        <div
            className='avatar avatar--initials'
            aria-hidden='true'
            style={{...sizeStyle, backgroundColor: pickColor(userId ?? name), fontSize: size * 0.4}}
        >
            {getInitials(name)}
        </div>
    );
};
