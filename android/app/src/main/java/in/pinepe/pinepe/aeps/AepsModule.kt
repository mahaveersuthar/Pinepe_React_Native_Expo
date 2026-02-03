package `in`.pinepe.pinepe.aeps

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.aeps.aepslib.newCode.AepsActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject

class AepsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var aepsPromise: Promise? = null

    companion object {
        private const val AEPS_REQUEST_CODE = 300
        private const val TAG = "AEPS"
    }

    private val activityEventListener = object : ActivityEventListener {

        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            Log.d(TAG, "== onActivityResult called ==")
            Log.d(TAG, "== requestCode: $requestCode resultCode: $resultCode ==")

            if (requestCode == AEPS_REQUEST_CODE && aepsPromise != null) {
                try {
                    if (resultCode == Activity.RESULT_OK && data != null) {
                        Log.d(TAG, "== AEPS RESULT OK ==")

                        val result = JSONObject().apply {
                            put("message", data.getStringExtra("message"))
                            put("statusCode", data.getStringExtra("statusCode"))
                            put("data", JSONObject(data.getStringExtra("data") ?: "{}"))
                        }

                        Log.d(TAG, "== AEPS RESULT DATA: $result ==")
                        aepsPromise?.resolve(result.toString())

                    } else {
                        Log.d(TAG, "== AEPS CANCELLED BY USER ==")
                        aepsPromise?.reject("CANCELLED", "AEPS cancelled")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "== AEPS ERROR: ${e.message} ==", e)
                    aepsPromise?.reject("ERROR", e.message, e)
                } finally {
                    Log.d(TAG, "== AEPS PROMISE CLEARED ==")
                    aepsPromise = null
                }
            }
        }

        override fun onNewIntent(intent: Intent) {
            Log.d(TAG, "== onNewIntent called (ignored) ==")
        }
    }

    init {
        Log.d(TAG, "== AEPS MODULE INITIALIZED ==")
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "AepsModule"

    @ReactMethod
    fun startAeps(
        agentId: String,
        developerId: String,
        password: String,
        bankVendorType: String,
        promise: Promise
    ) {
        Log.d(TAG, "== startAeps CALLED ==")

        if (aepsPromise != null) {
            Log.d(TAG, "== AEPS ALREADY RUNNING ==")
            promise.reject("IN_PROGRESS", "AEPS already running")
            return
        }

        val activity = reactContext.currentActivity
        if (activity == null) {
            Log.e(TAG, "== CURRENT ACTIVITY IS NULL ==")
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        aepsPromise = promise

        Log.d(TAG, "== LAUNCHING AEPS ACTIVITY ==")
        Log.d(TAG, "== agentId: $agentId developerId: $developerId ==")

        val intent = Intent(activity, AepsActivity::class.java).apply {
            putExtra("agent_id", agentId)
            putExtra("developer_id", developerId)
            putExtra("password", password)
            putExtra("bankVendorType", bankVendorType)
            putExtra("clientTransactionId", System.currentTimeMillis().toString())
        }

        activity.startActivityForResult(intent, AEPS_REQUEST_CODE)
        Log.d(TAG, "== AEPS ACTIVITY STARTED ==")
    }
}
