import Root from './dialog.svelte';
import Portal from './dialog-portal.svelte';
import Trigger from './dialog-trigger.svelte';
import Close from './dialog-close.svelte';
import Overlay from './dialog-overlay.svelte';
import Content from './dialog-content.svelte';
import Header from './dialog-header.svelte';
import Footer from './dialog-footer.svelte';
import Title from './dialog-title.svelte';
import Description from './dialog-description.svelte';

export {
	Root,
	Close,
	Trigger,
	Portal,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	//
	Root as Dialog,
	Close as DialogClose,
	Trigger as DialogTrigger,
	Portal as DialogPortal,
	Overlay as DialogOverlay,
	Content as DialogContent,
	Header as DialogHeader,
	Footer as DialogFooter,
	Title as DialogTitle,
	Description as DialogDescription
};
