import { render, screen } from '@testing-library/react';
import Button from '@/app/components/elements/Button';
import adduserIcon from '../public/adduser.svg';

test('render button tests', () => {
    render(<Button
            icon={adduserIcon}
            title={'My button'}
         />);
    const getTitle = screen.getByText('My button');
    expect(getTitle).toBeInTheDocument();
})
test('find alt text of button tests', () => {
    render(<Button
            icon={adduserIcon}
         />);
    const altText = screen.getByAltText('icon')
    expect(altText).toBeInTheDocument();
})