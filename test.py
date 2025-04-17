from openai import OpenAI

client = OpenAI(
    api_key="AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-2.0-flash",
    n=1,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Hi"
        }
    ]
)

print(response.choices[0].message.content)