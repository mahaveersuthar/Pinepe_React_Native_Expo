package `in`.pinepe.pinepe.paysprint

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONObject

class PaysprintModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var paysprintPromise: Promise? = null

    companion object {
        private const val TAG = "PAYSPRINT"
        private const val PAYSPRINT_REQUEST_CODE = 1111
    }

    private val activityEventListener = object : ActivityEventListener {

        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            Log.d(TAG, "onActivityResult called")

            if (requestCode == PAYSPRINT_REQUEST_CODE && paysprintPromise != null) {
                try {
                    if (resultCode == Activity.RESULT_OK && data != null) {

                        val status = data.getBooleanExtra("status", false)
                        val response = data.getIntExtra("response", 0)
                        val message = data.getStringExtra("message")

                        val result = JSONObject().apply {
                            put("status", status)
                            put("response", response)
                            put("message", message)
                        }

                        Log.d(TAG, "Paysprint result: $result")
                        paysprintPromise?.resolve(result.toString())

                    } else {
                        paysprintPromise?.reject(
                            "CANCELLED",
                            "Paysprint cancelled by user"
                        )
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Paysprint error", e)
                    paysprintPromise?.reject("ERROR", e.message, e)
                } finally {
                    paysprintPromise = null
                }
            }
        }

        override fun onNewIntent(intent: Intent) {}
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "PaysprintModule"

    @ReactMethod
    fun startPaysprint(
        pId: String,
        pApiKey: String,
        mCode: String,
        mobile: String,
        lat: String,
        lng: String,
        pipe: String,
        firm: String,
        email: String,
        promise: Promise
    ) {

        if (paysprintPromise != null) {
            promise.reject("IN_PROGRESS", "Paysprint already running")
            return
        }

        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        paysprintPromise = promise

       
        val intent = Intent().apply {
    setClassName(
                activity,
                "com.paysprint.onboardinglib.activities.HostActivity"
            )

    putExtra("pId", pId)
    putExtra("pApiKey", pApiKey)
    putExtra("mCode", mCode)
    putExtra("mobile", mobile)
    putExtra("lat", lat)
    putExtra("lng", lng)
    putExtra("pipe", pipe)
    putExtra("firm", firm)
    putExtra("email", email)

    addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
}


        activity.startActivityForResult(intent, PAYSPRINT_REQUEST_CODE)
    }
}
