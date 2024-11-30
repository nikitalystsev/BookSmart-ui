import {Col, Row} from "react-bootstrap";
import React, {ReactNode} from "react";

interface MatrixProps<T> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    countColumns: number; // число столбцов (пусть будет кратно 12)
    rowAlign: string;
    colAlign: string;
}

const Matrix = <T, >({items, renderItem, countColumns, rowAlign, colAlign}: MatrixProps<T>): JSX.Element => {
    const rows = Math.ceil(items.length / countColumns);

    return (
        <>
            {Array.from({length: rows}).map((_, rowIndex) => (
                <Row key={rowIndex} className={rowAlign}>
                    {items.slice(rowIndex * countColumns, rowIndex * countColumns + countColumns).map((item: T, index: number) => (
                        <Col key={index} className={colAlign}>
                            {renderItem(item)}
                        </Col>
                    ))}
                </Row>
            ))}
        </>
    );
};

export default Matrix;
