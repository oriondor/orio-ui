import { ref } from "vue";

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ModalProps {
  show: boolean;
  origin: OriginRect | null;
  "onUpdate:show": (state: boolean) => void;
}

export function useModal() {
  const modalProps = ref<ModalProps>({
    show: false,
    origin: null,
    "onUpdate:show": (state: boolean) => updateShow(state),
  });

  function updateShow(state: boolean) {
    modalProps.value.show = state;
  }

  function openModal(event?: MouseEvent) {
    modalProps.value.origin = null;
    if (!event) {
      modalProps.value.show = true;
      return;
    }
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    modalProps.value.origin = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };

    modalProps.value.show = true;
  }

  return { modalProps, openModal };
}
