import { htmlInject } from './html-inject';

describe('HTML Inject', () => {
    it('should inject after <head> if head is present', () => {
        expect(htmlInject('<html><head><title>Content</title></head></html>', 'var injected = true;')).toEqual(
            '<html><head>var injected = true;<title>Content</title></head></html>'
        );
    });
    it('should inject after <html> if head is not present', () => {
        expect(htmlInject('<html><title>Content</title></html>', 'var injected = true;')).toEqual(
            '<html>var injected = true;<title>Content</title></html>'
        );
    });
    it('should inject before everything if html and head are not present', () => {
        expect(htmlInject('<title>Content</title>', 'var injected = true;')).toEqual(
            'var injected = true;<title>Content</title>'
        );
    });
});
