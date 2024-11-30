import {ChangeEvent, FC} from "react";
import {Col, Form} from "react-bootstrap";
import '../css/book-param.css'

interface Option {
    value: string;
    label: string;
}

export interface SearchParamProps {
    id: string;
    type: string;
    placeholder: string;
    options?: Option[];
    onChange: (event: ChangeEvent) => void;
}

const BookParam: FC<SearchParamProps> = ({id, type, placeholder, options, onChange}) => {
    const renderField = () => {
        switch (type) {
            case 'select':
                return (
                    <Form.Select className="my-search-param-form" id={id} onChange={onChange}>
                        <option value="">{placeholder}</option>
                        {options?.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                );
            default:
                return (
                    <Form.Control
                        className="my-search-param-form"
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        onChange={onChange}
                    />
                );
        }
    };

    return <Col className="my-1">{renderField()}</Col>;
};

export default BookParam