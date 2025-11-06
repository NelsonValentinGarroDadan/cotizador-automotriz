'use client';
import CustomButton from "./ui/customButton";

 

interface WindowFormButtonProps {
  formUrl: string; // ruta del formulario
  onCreated?: () => void; // callback al crear
  buttonText: React.ReactElement;
  className?: string;
  title?: string;
}

export default function WindowFormButton ({ formUrl, onCreated, buttonText, className,title }:WindowFormButtonProps) {
  const handleClick = () => {
    const newWindow = window.open(formUrl, 'Form', 'width=600,height=700');
    if (!newWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.created) {
        onCreated?.();
        window.removeEventListener('message', handleMessage);
        newWindow.close();
      }
    };

    window.addEventListener('message', handleMessage);
  };

  return (
    <CustomButton onClick={handleClick} className={className} title={title}>
      {buttonText}
    </CustomButton>
  );
};
