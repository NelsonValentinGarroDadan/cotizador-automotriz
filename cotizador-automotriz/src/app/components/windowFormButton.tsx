'use client';
import CustomButton from "./ui/customButton";

 

interface WindowFormButtonProps {
  formUrl: string; // ruta del formulario
  onCreated?: () => void; // callback al crear
  buttonText: React.ReactElement;
  className?: string;
  title?: string;
  width?:number;
  height?:number;
  onClick?: () => void;
}

export default function WindowFormButton ({
  formUrl,
  onCreated,
  buttonText,
  className,
  title,
  height=700,
  width=600,
  onClick,
}:WindowFormButtonProps) {
  const handleClick = () => {
    const newWindow = window.open(formUrl, 'Form', `width=${width},height=${height}`);
    if (!newWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.created) {
        try {
          onCreated?.();
        } catch (err) {
          console.warn('[WindowFormButton] onCreated handler failed', err);
        }
        window.removeEventListener('message', handleMessage);
        newWindow.close();
      }
    };

    window.addEventListener('message', handleMessage);
    onClick?.();
  };

  return (
    <CustomButton onClick={handleClick} className={className} title={title}>
      {buttonText}
    </CustomButton>
  );
};
