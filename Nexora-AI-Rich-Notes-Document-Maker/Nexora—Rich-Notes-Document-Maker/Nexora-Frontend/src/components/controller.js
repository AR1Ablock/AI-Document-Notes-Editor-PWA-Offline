import { ref } from "vue";


export let controller = new AbortController();


export let Cancel_Operation = ref(false);

export function abort_Controller() {
    try {
        if (Cancel_Operation.value) {
            console.log("aborted called");
            controller.abort();
            Cancel_Operation.value = false;
            resetController();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error.message);
    }
}

export function resetController() {
    try {
        controller = new AbortController();
    } catch (error) {
        console.log(error.message);
    }
}