let net;
const webcamElement = document.getElementById('webcam')
const classifier = knnClassifier.create();
let frame_count = 0

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia || navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia || navigatorAny.msGetUserMedia
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                {video: true},
                stream => {
                    webcamElement.srcObject = stream
                    webcamElement.addEventListener('loadeddata', ()=>resolve(), false)
                },
                error => reject())
        } else {
            reject()
        }
    })
}

async function app() {
    console.log('Loading mobilenet . . .')

    // Load Model
    net = await mobilenet.load()
    console.log('Successfully loaded model')

    await setupWebcam()

    // Read an image from the webcam and associate it with one of the classes
    const addExample = classId => {
        // Get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier.
        const activation = net.infer(webcamElement, 'conv_preds');
        // Pass the intermediate activation to the classifier.
        classifier.addExample(activation, classId);
    };


    // When clicking a button, add an example for that class
    document.getElementById('class-a').addEventListener('click', () => addExample(0))
    document.getElementById('class-b').addEventListener('click', () => addExample(1))
    document.getElementById('class-c').addEventListener('click', () => addExample(2))
    document.getElementById('class-d').addEventListener('click', () => addExample(3))

    while (true) {
        if (classifier.getNumClasses() > 0) {
            // console.log(classifier.getNumClasses())
            // addExample(3)
            const activation = net.infer(webcamElement, 'conv_preds')
            const result = await classifier.predictClass(activation)

            const classes = ['A', 'B', 'C', 'No_Action']
            // console.log(result.confidences,result.classIndex, )
            document.getElementById('console').innerText = `
            prediction: ${classes[parseInt(result.label)]}\n
            probability: ${result.confidences[parseInt(result.label)]}`
        }
        await tf.nextFrame()

    }
    // Make Prediction through the model on our image
    // const imgEl = document.getElementById('img')
    // const result = await net.classify(imgEl)

    // console.log(result)
}

app();